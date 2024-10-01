import type { APIEvent } from "@solidjs/start/server";
import type { PushRequestV1 } from "replicache";
import { getServerContext } from "~/server/context";
import { broadcastChannel } from "~/server/realtime/channel";
import {
	selectGameVersion,
	selectLastMutationIds,
	setLastMutationIds,
	updateGameVersion,
} from "~/server/replicache/db";
import { handleMutation } from "~/server/replicache/process-mutation";

export const POST = async (event: APIEvent) => {
	const ctx = getServerContext(event);

	const gameId = event.params.gameId;
	const push: PushRequestV1 = await event.request.json();

	await ctx.db.transaction(async (transaction) => {
		const previousVersion = await selectGameVersion(ctx, transaction, {
			gameId,
		});

		if (!previousVersion) {
			throw new Error(`Unknown game ${gameId}`);
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
			await handleMutation(ctx, transaction, { mutation, nextVersion });

			lastMutationIds.set(mutation.clientID, nextMutationId);
		}

		await Promise.all([
			// Update lastMutationID for requesting client.
			setLastMutationIds(ctx, transaction, {
				lastMutationIds,
				clientGroupId: push.clientGroupID,
				version: nextVersion,
			}),
			// Update global version.
			updateGameVersion(ctx, transaction, {
				serverId: gameId,
				version: nextVersion,
			}),
		]);

		sendPoke();
	});
};

const sendPoke = () => {
	broadcastChannel.postMessage({ kind: "poke" });
};
