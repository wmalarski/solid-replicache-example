"use server";
import { redirect } from "@solidjs/router";
import { paths } from "~/utils/paths";
import { getServerContext } from "../context";
import { insertSpace } from "../replicache/db";
import { getRequestEventOrThrow, rpcParseIssueResult } from "../utils";
import { insertGame, selectGame } from "./db";
import { parseBoardConfig } from "./utils";

export const insertGameServerAction = async (formData: FormData) => {
	const parsed = await parseBoardConfig(formData);

	if (!parsed.success) {
		return rpcParseIssueResult(parsed.issues);
	}

	const event = getRequestEventOrThrow();
	const ctx = getServerContext(event);

	const space = await insertSpace(ctx, ctx.db);

	await insertGame(ctx, ctx.db, {
		...parsed.output,
		spaceId: space.id,
	});

	throw redirect(paths.game(space.id));
};

export const selectGameServerLoader = async (spaceId: string) => {
	const event = getRequestEventOrThrow();
	const ctx = getServerContext(event);

	const game = await selectGame(ctx, ctx.db, { spaceId });

	return game;
};
