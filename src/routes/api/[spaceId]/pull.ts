import type { APIEvent } from "@solidjs/start/server";
import type { PullRequestV1 } from "replicache";
import { getServerContext } from "~/server/context";
import {} from "~/server/replicache/db";
import { processPull } from "~/server/replicache/process-pull";

export const POST = async (event: APIEvent) => {
	const ctx = getServerContext(event);

	const gameId = event.params.gameId;
	const pull: PullRequestV1 = await event.request.json();

	return ctx.db.transaction(async (transaction) =>
		processPull(ctx, transaction, { gameId, pull }),
	);
};
