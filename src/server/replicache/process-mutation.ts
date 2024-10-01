"use server";
import type { MutationV1 } from "replicache";
import type { ServerContext } from "../context";
import type { Transaction } from "../db/db";
import { insertMessage } from "../messages/db";
import type { MessageWithID } from "../messages/types";
import {
	selectLastMutationId,
	selectServerVersion,
	setLastMutationId,
	updateGameVersion,
} from "./db";

type ProcessMutationArgs = {
	clientGroupId: string;
	mutation: MutationV1;
	serverId: string;
	error?: string | undefined;
};

export const processMutation = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ clientGroupId, mutation, error, serverId }: ProcessMutationArgs,
) => {
	const { clientID: clientId } = mutation;

	// Get the previous version and calculate the next one.
	const previousVersion = await selectServerVersion(ctx, transaction, {
		serverId,
	});

	if (!previousVersion) {
		return;
	}

	const nextVersion = previousVersion + 1;

	const lastMutationID = await selectLastMutationId(ctx, transaction, {
		clientId,
	});

	const nextMutationID = lastMutationID + 1;

	console.log("nextVersion", nextVersion, "nextMutationID", nextMutationID);

	// It's common due to connectivity issues for clients to send a
	// mutation which has already been processed. Skip these.
	if (mutation.id < nextMutationID) {
		console.log(
			`Mutation ${mutation.id} has already been processed - skipping`,
		);
		return;
	}

	// If the Replicache client is working correctly, this can never
	// happen. If it does there is nothing to do but return an error to
	// client and report a bug to Replicache.
	if (mutation.id > nextMutationID) {
		throw new Error(
			`Mutation ${mutation.id} is from the future - aborting. This can happen in development if the server restarts. In that case, clear appliation data in browser and refresh.`,
		);
	}

	if (error === undefined) {
		console.log("Processing mutation:", JSON.stringify(mutation));

		// For each possible mutation, run the server-side logic to apply the
		// mutation.
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
	} else {
		// TODO: You can store state here in the database to return to clients to
		// provide additional info about errors.
		console.log(
			"Handling error from mutation",
			JSON.stringify(mutation),
			error,
		);
	}

	console.log("setting", clientId, "last_mutation_id to", nextMutationID);

	await Promise.all([
		// Update lastMutationID for requesting client.
		setLastMutationId(ctx, transaction, {
			clientId,
			clientGroupId,
			mutationId: nextMutationID,
			version: nextVersion,
		}),
		// Update global version.
		updateGameVersion(ctx, transaction, {
			serverId,
			version: nextVersion,
		}),
	]);
};
