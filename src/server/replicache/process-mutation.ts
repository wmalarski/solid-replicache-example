"use server";
import type { MutationV1 } from "replicache";
import {
	type InsertCellArgs,
	type UpdateCellArgs,
	insertCell,
	updateCell,
	updateCells,
} from "../cells/db";
import type { ServerContext } from "../context";
import type { Transaction } from "../db/db";
import { type InsertGameArgs, insertGame, updateGame } from "../games/db";

export type ResetGameArgs = InsertGameArgs & {
	previousGameId: string;
};

type ProcessMutationArgs = {
	mutation: MutationV1;
	nextVersion: number;
};

export const processMutation = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ mutation, nextVersion }: ProcessMutationArgs,
) => {
	switch (mutation.name) {
		case "insertCell":
			await insertCell(ctx, transaction, {
				...(mutation.args as InsertCellArgs),
				version: nextVersion,
			});
			break;
		case "updateCell":
			await updateCell(ctx, transaction, {
				...(mutation.args as UpdateCellArgs),
				version: nextVersion,
			});
			break;
		case "insertGame":
			await insertGame(ctx, transaction, {
				...(mutation.args as InsertGameArgs),
				version: nextVersion,
			});
			break;
		case "resetGame": {
			const { previousGameId, ...args } = mutation.args as ResetGameArgs;
			await Promise.all([
				updateGame(ctx, transaction, {
					deleted: true,
					id: previousGameId,
					version: nextVersion,
				}),
				updateCells(ctx, transaction, {
					deleted: true,
					gameId: previousGameId,
					version: nextVersion,
				}),
				insertGame(ctx, transaction, {
					...args,
					version: nextVersion,
				}),
			]);
			break;
		}
		default:
			throw new Error(`Unknown mutation: ${mutation.name}`);
	}
};
