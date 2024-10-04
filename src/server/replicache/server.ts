"use server";
import { redirect } from "@solidjs/router";
import { decode } from "decode-formdata";
import * as v from "valibot";
import { paths } from "~/utils/paths";
import { getServerContext } from "../context";
import { getRequestEventOrThrow, rpcParseIssueResult } from "../utils";
import {
	BOARD_MAX_MINES,
	BOARD_MAX_SIZE,
	BOARD_MIN_MINES,
	BOARD_MIN_SIZE,
} from "./const";
import { insertGame, selectGame } from "./db";

export const insertGameServerAction = async (formData: FormData) => {
	const parsed = await v.safeParseAsync(
		v.object({
			width: v.pipe(
				v.number(),
				v.minValue(BOARD_MIN_SIZE),
				v.maxValue(BOARD_MAX_SIZE),
			),
			height: v.pipe(
				v.number(),
				v.minValue(BOARD_MIN_SIZE),
				v.maxValue(BOARD_MAX_SIZE),
			),
			name: v.string(),
			mines: v.pipe(
				v.number(),
				v.minValue(BOARD_MIN_MINES),
				v.maxValue(BOARD_MAX_MINES),
			),
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
