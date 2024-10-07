"use server";
import { getServerContext } from "../context";
import { insertSpace } from "../replicache/db";
import { getRequestEventOrThrow } from "../utils";

export const insertSpaceServerAction = async () => {
	const event = getRequestEventOrThrow();
	const ctx = getServerContext(event);

	return insertSpace(ctx, ctx.db);
};
