"use server";
import { redirect } from "@solidjs/router";
import { paths } from "~/utils/paths";
import { getServerContext } from "../context";
import { getRequestEventOrThrow, rpcParseIssueResult } from "../utils";
import {} from "./const";
import { insertGame, selectGame } from "./db";
import { parseBoardConfig } from "./utils";

export const insertGameServerAction = async (formData: FormData) => {
	const parsed = await parseBoardConfig(formData);

	if (!parsed.success) {
		return rpcParseIssueResult(parsed.issues);
	}

	const event = getRequestEventOrThrow();
	const ctx = getServerContext(event);

	const game = await insertGame(ctx, ctx.db, parsed.output);

	throw redirect(paths.game(game.id));
};

export const selectGameServerLoader = async (gameId: string) => {
	const event = getRequestEventOrThrow();
	const ctx = getServerContext(event);

	const game = await selectGame(ctx, ctx.db, { gameId });

	return game;
};
