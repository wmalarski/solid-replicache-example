"use server";
import { getServerContext } from "../context";
import { getRequestEventOrThrow } from "../utils";
import { selectGame } from "./db";

export const selectGameServerLoader = async (spaceId: string) => {
	const event = getRequestEventOrThrow();
	const ctx = getServerContext(event);

	const game = await selectGame(ctx, ctx.db, { spaceId });

	return game;
};
