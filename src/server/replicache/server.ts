"use server";
import { redirect } from "@solidjs/router";
import { paths } from "~/utils/paths";
import { getServerContext } from "../context";
import { insertSpace } from "../replicache/db";
import { getRequestEventOrThrow } from "../utils";

export const insertSpaceServerAction = async () => {
	const event = getRequestEventOrThrow();
	const ctx = getServerContext(event);

	const space = await insertSpace(ctx, ctx.db);

	throw redirect(paths.space(space.id));
};
