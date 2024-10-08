"use server";
import { and, eq, gt } from "drizzle-orm";
import type { ServerContext } from "../context";
import type { Transaction } from "../db/db";
import type { WithVersion } from "../utils";

type SelectGameArgs = {
	spaceId: string;
};

export const selectGame = (
	ctx: ServerContext,
	transaction: Transaction,
	{ spaceId }: SelectGameArgs,
) => {
	return transaction
		.select({
			id: ctx.schema.Game.id,
			spaceId: ctx.schema.Game.spaceId,
			name: ctx.schema.Game.name,
			width: ctx.schema.Game.width,
			height: ctx.schema.Game.height,
			mines: ctx.schema.Game.mines,
			code: ctx.schema.Game.code,
			startedAt: ctx.schema.Game.startedAt,
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
};

export type SelectGameResult = NonNullable<
	Awaited<ReturnType<typeof selectGame>>
>;

type SelectGamesArgs = {
	spaceId: string;
	fromVersion: number;
};

export const selectGames = (
	ctx: ServerContext,
	transaction: Transaction,
	{ fromVersion, spaceId }: SelectGamesArgs,
) => {
	return transaction
		.select()
		.from(ctx.schema.Game)
		.where(
			and(
				gt(ctx.schema.Game.version, fromVersion),
				eq(ctx.schema.Game.spaceId, spaceId),
			),
		)
		.all();
};

export type InsertGameArgs = {
	id: string;
	code: string;
	width: number;
	height: number;
	name: string;
	mines: number;
	spaceId: string;
};

export const insertGame = (
	ctx: ServerContext,
	transaction: Transaction,
	args: WithVersion<InsertGameArgs>,
) => {
	return transaction
		.insert(ctx.schema.Game)
		.values({ ...args, deleted: false, startedAt: null })
		.returning()
		.get();
};

export type UpdateGameArgs = {
	id: string;
	deleted?: boolean;
	startedAt?: number | null;
};

export const updateGame = (
	ctx: ServerContext,
	transaction: Transaction,
	{ id, deleted, startedAt, version }: WithVersion<UpdateGameArgs>,
) => {
	return transaction
		.update(ctx.schema.Game)
		.set({ deleted, startedAt, version })
		.where(eq(ctx.schema.Game.id, id))
		.run();
};
