import type { APIEvent } from "@solidjs/start/server";
import { ConvexHttpClient } from "convex/browser";
import type { MutationV1, PushRequestV1 } from "replicache";
import type { MessageWithID } from "~/server/messages/types";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const serverId = "jh7erv1aw1kxwtnk4kbjc0hsr571gafd" as Id<"replicache_server">;

export const POST = async (event: APIEvent) => {
	return await push(event);
};

const push = async (event: APIEvent) => {
	const httpClient = new ConvexHttpClient(import.meta.env.CONVEX_URL);

	const push: PushRequestV1 = await event.request.json();

	console.log("Processing push", JSON.stringify(push));

	const t0 = Date.now();

	try {
		// Iterate each mutation in the push.
		for (const mutation of push.mutations) {
			const t1 = Date.now();

			try {
				await processMutation(httpClient, push.clientGroupID, mutation);
			} catch (e) {
				console.error("Caught error from mutation", mutation, e);

				// Handle errors inside mutations by skipping and moving on. This is
				// convenient in development but you may want to reconsider as your app
				// gets close to production:
				// https://doc.replicache.dev/reference/server-push#error-handling
				await processMutation(
					httpClient,
					push.clientGroupID,
					mutation,
					e as string,
				);
			}

			console.log("Processed mutation in", Date.now() - t1);
		}

		await sendPoke();

		return {};
	} catch (error) {
		console.error(error);

		return new Response(String(error), { status: 500 });
	} finally {
		console.log("Processed push in", Date.now() - t0);
	}
};

async function processMutation(
	httpClient: ConvexHttpClient,
	clientGroupID: string,
	mutation: MutationV1,
	error?: string | undefined,
) {
	const { clientID } = mutation;

	// Get the previous version and calculate the next one.
	const previousVersion = await httpClient.query(
		api.replicache.selectServerVersion,
		{ serverId },
	);

	if (!previousVersion) {
		return;
	}

	const nextVersion = previousVersion + 1;

	const lastMutationID = await getLastMutationID(httpClient, clientID);
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
				await createMessage(mutation.args as MessageWithID, nextVersion);
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

	console.log("setting", clientID, "last_mutation_id to", nextMutationID);
	// Update lastMutationID for requesting client.
	await setLastMutationID(
		httpClient,
		clientID,
		clientGroupID,
		nextMutationID,
		nextVersion,
	);

	// Update global version.
	await httpClient.mutation(api.replicache.updateServerVersion, {
		serverId,
		version: nextVersion,
	});
}

export async function getLastMutationID(
	httpClient: ConvexHttpClient,
	clientId: string,
) {
	const lastMutationId = await httpClient.query(
		api.replicache.selectLastMutationId,
		{ clientId: clientId as Id<"replicache_client"> },
	);

	return lastMutationId ?? 0;
}

async function setLastMutationID(
	httpClient: ConvexHttpClient,
	clientId: string,
	clientGroupId: string,
	mutationId: number,
	version: number,
) {
	const result = await httpClient.mutation(
		api.replicache.updateClientMutation,
		{
			clientGroupId,
			clientId: clientId as Id<"replicache_client">,
			lastMutationId: mutationId,
			version,
		},
	);

	if (result?.rowCount === 0) {
		await t.none(
			`insert into replicache_client (
        id,
        client_group_id,
        last_mutation_id,
        version
      ) values ($1, $2, $3, $4)`,
			[clientId, clientGroupId, mutationId, version],
		);
	}
}

async function createMessage(
	{ id, from, content, order }: MessageWithID,
	version: number,
) {
	await t.none(
		`insert into message (
    id, sender, content, ord, deleted, version) values
    ($1, $2, $3, $4, false, $5)`,
		[id, from, content, order, version],
	);
}

async function sendPoke() {
	// TODO
}
