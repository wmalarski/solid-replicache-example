import type { APIEvent } from "@solidjs/start/server";
import type { PushRequestV1 } from "replicache";
import { getServerContext } from "~/server/context";
import { processPush } from "~/server/replicache/process-push";

export const POST = async (event: APIEvent) => {
	const ctx = getServerContext(event);

	const spaceId = event.params.spaceId;
	const push: PushRequestV1 = await event.request.json();

	await ctx.db.transaction(async (transaction) =>
		processPush(ctx, transaction, { spaceId, push }),
	);

	return {};
};
