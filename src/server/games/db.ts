"use server";
import { and, eq } from "drizzle-orm";
import type { ServerContext } from "../context";
import type { Transaction } from "../db/db";
import { generateServerGameCode } from "./utils";

type SelectGameArgs = {
	spaceId: string;
};

export const selectGame = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ spaceId }: SelectGameArgs,
) => {
	const row = await transaction
		.select({
			id: ctx.schema.Game.id,
			spaceId: ctx.schema.Game.spaceId,
			name: ctx.schema.Game.name,
			width: ctx.schema.Game.width,
			height: ctx.schema.Game.height,
			mines: ctx.schema.Game.mines,
			code: ctx.schema.Game.code,
		})
		.from(ctx.schema.Game)
		.where(
			and(
				eq(ctx.schema.Game.spaceId, spaceId),
				eq(ctx.schema.Game.deleted, false),
			),
		)
		.limit(1)
		.get();

	return row;
};

export type SelectGameResult = NonNullable<
	Awaited<ReturnType<typeof selectGame>>
>;

type InsertGameArgs = {
	width: number;
	height: number;
	name: string;
	mines: number;
	spaceId: string;
};

export const insertGame = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ height, width, mines, name, spaceId }: InsertGameArgs,
) => {
	if (!ctx.event.clientAddress) {
		throw new Error("Invalid request");
	}

	return transaction
		.insert(ctx.schema.Game)
		.values({
			id: crypto.randomUUID(),
			spaceId,
			code: generateServerGameCode({ height, mines, width }),
			height,
			mines,
			name,
			width,
			version: 1,
			deleted: false,
		})
		.returning()
		.get();
};
