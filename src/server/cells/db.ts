"use server";
import { and, eq, gt } from "drizzle-orm";
import type { ServerContext } from "../context";
import type { Transaction } from "../db/db";
import type { GameCell } from "./types";

type WithVersion<T> = T & {
	version: number;
};

export type InsertCellArgs = GameCell;

export const insertCell = (
	ctx: ServerContext,
	transaction: Transaction,
	args: WithVersion<InsertCellArgs>,
) => {
	return transaction.insert(ctx.schema.Cell).values({
		...args,
		deleted: false,
	});
};

type SelectCellsArgs = {
	spaceId: string;
	fromVersion: number;
};

export const selectCells = (
	ctx: ServerContext,
	transaction: Transaction,
	{ fromVersion, spaceId }: SelectCellsArgs,
) => {
	return transaction
		.select()
		.from(ctx.schema.Cell)
		.leftJoin(ctx.schema.Game, eq(ctx.schema.Game.id, ctx.schema.Cell.gameId))
		.where(
			and(
				gt(ctx.schema.Cell.version, fromVersion),
				eq(ctx.schema.Game.spaceId, spaceId),
			),
		)
		.all();
};

export type UpdateCellArgs = {
	id: string;
	marked: boolean;
	clicked: boolean;
};

export const updateCell = (
	ctx: ServerContext,
	transaction: Transaction,
	{ clicked, id, marked, version }: WithVersion<UpdateCellArgs>,
) => {
	return transaction
		.update(ctx.schema.Cell)
		.set({ clicked, marked, version })
		.where(eq(ctx.schema.Cell.id, id))
		.run();
};
