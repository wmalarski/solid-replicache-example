"use server";
import { redirect } from "@solidjs/router";
import { decode } from "decode-formdata";
import * as v from "valibot";
import { paths } from "~/utils/paths";
import { getServerContext } from "../context";
import { getRequestEventOrThrow, rpcParseIssueResult } from "../utils";
import { insertGame, selectGame } from "./db";

export const insertGameServerAction = async (formData: FormData) => {
	const parsed = await v.safeParseAsync(
		v.object({
			width: v.number(),
			height: v.number(),
			name: v.string(),
			mines: v.number(),
		}),
		decode(formData, { numbers: ["mines", "height", "width"] }),
	);

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
