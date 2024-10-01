"use server";
import type { MutationV1 } from "replicache";
import type { ServerContext } from "../context";
import type { Transaction } from "../db/db";
import { insertMessage } from "../messages/db";
import type { MessageWithID } from "../messages/types";

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
		case "createMessage":
			await insertMessage(ctx, transaction, {
				...(mutation.args as MessageWithID),
				version: nextVersion,
			});
			break;
		default:
			throw new Error(`Unknown mutation: ${mutation.name}`);
	}
};
