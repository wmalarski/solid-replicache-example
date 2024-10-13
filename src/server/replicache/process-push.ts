import type { PushRequestV1 } from "replicache";
import { getClientSupabase } from "~/utils/supabase";
import type { ServerContext } from "../context";
import type { Transaction } from "../db/db";
import { broadcastChannel } from "../realtime/channel";
import {
	selectLastMutationIds,
	selectSpaceVersion,
	setLastMutationId,
	updateSpaceVersion,
} from "./db";
import { processMutation } from "./process-mutation";

type ProcessPushArgs = {
	spaceId: string;
	push: PushRequestV1;
};

export const processPush = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ spaceId, push }: ProcessPushArgs,
) => {
	const previousVersion = await selectSpaceVersion(ctx, transaction, {
		spaceId,
	});

	if (!previousVersion) {
		throw new Error(`Unknown space ${spaceId}`);
	}

	const nextVersion = previousVersion + 1;

	const clientIds = [...new Set(push.mutations.map((m) => m.clientID))];
	const lastMutationIds = await selectLastMutationIds(ctx, transaction, {
		clientIds,
	});

	for (const mutation of push.mutations) {
		const lastMutationId = lastMutationIds.get(mutation.clientID);

		if (lastMutationId === undefined) {
			throw new Error(
				`invalid state - lastMutationID not found for client: ${mutation.clientID}`,
			);
		}

		const nextMutationId = lastMutationId + 1;

		// It's common due to connectivity issues for clients to send a
		// mutation which has already been processed. Skip these.
		if (mutation.id < nextMutationId) {
			console.log(
				`Mutation ${mutation.id} has already been processed - skipping`,
			);
			return;
		}

		// If the Replicache client is working correctly, this can never
		// happen. If it does there is nothing to do but return an error to
		// client and report a bug to Replicache.
		if (mutation.id > nextMutationId) {
			throw new Error(
				`Mutation ${mutation.id} is from the future - aborting. This can happen in development if the server restarts. In that case, clear appliation data in browser and refresh.`,
			);
		}

		// For each possible mutation, run the server-side logic to apply the
		// mutation.
		await processMutation(ctx, transaction, { mutation, nextVersion });

		lastMutationIds.set(mutation.clientID, nextMutationId);
	}

	await Promise.all([
		// Update lastMutationID for requesting client.
		...Array.from(lastMutationIds.entries()).map(([clientId, mutationId]) =>
			setLastMutationId(ctx, transaction, {
				clientGroupId: push.clientGroupID,
				version: nextVersion,
				clientId,
				mutationId,
			}),
		),
		// Update global version.
		updateSpaceVersion(ctx, transaction, {
			spaceId,
			version: nextVersion,
		}),
	]);

	sendPoke(spaceId);
};

const sendPoke = async (spaceId: string) => {
	const channel = getClientSupabase().channel(`rooms:broadcast:${spaceId}`);
	await channel.send({
		type: "broadcast",
		event: "rooms:sync",
		payload: {},
	});

	broadcastChannel.postMessage({ kind: "poke" });
};
