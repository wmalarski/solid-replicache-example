import type { APIEvent } from "@solidjs/start/server";
import type { PushRequestV1 } from "replicache";
import { type ServerContext, getServerContext } from "~/server/context";
import { processMutation } from "~/server/replicache/process-mutation";

export const POST = async (event: APIEvent) => {
	const ctx = getServerContext(event);

	const push: PushRequestV1 = await event.request.json();

	console.log("Processing push", JSON.stringify(push));

	const t0 = Date.now();

	try {
		// Iterate each mutation in the push.
		for (const mutation of push.mutations) {
			const t1 = Date.now();

			try {
				await ctx.db.transaction((transaction) =>
					processMutation(ctx, transaction, {
						clientGroupId: push.clientGroupID,
						mutation,
					}),
				);
			} catch (error) {
				console.error("Caught error from mutation", mutation, error);

				// Handle errors inside mutations by skipping and moving on. This is
				// convenient in development but you may want to reconsider as your app
				// gets close to production:
				// https://doc.replicache.dev/reference/server-push#error-handling
				await ctx.db.transaction((transaction) =>
					processMutation(ctx, transaction, {
						clientGroupId: push.clientGroupID,
						mutation,
						error: error as string,
					}),
				);
			}

			console.log("Processed mutation in", Date.now() - t1);
		}

		await sendPoke(ctx);

		return {};
	} catch (error) {
		console.error(error);

		return new Response(String(error), { status: 500 });
	} finally {
		console.log("Processed push in", Date.now() - t0);
	}
};

async function sendPoke(ctx: ServerContext) {
	console.log("EVENT", ctx.event);
}
