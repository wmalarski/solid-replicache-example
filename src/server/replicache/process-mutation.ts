"use server";
import type { MutationV1 } from "replicache";
import {
	type DeleteCellsArgs,
	type InsertCellArgs,
	type UpdateCellArgs,
	deleteCells,
	insertCell,
	updateCell,
} from "../cells/db";
import type { ServerContext } from "../context";
import type { Transaction } from "../db/db";

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
		case "resetGame":
			await deleteCells(ctx, transaction, {
				...(mutation.args as DeleteCellsArgs),
				version: nextVersion,
			});
			break;
		default:
			throw new Error(`Unknown mutation: ${mutation.name}`);
	}
};
