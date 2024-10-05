"use server";
import bcrypt from "bcryptjs";
import { and, eq, gt, inArray } from "drizzle-orm";
import type { ServerContext } from "../context";
import type { Transaction } from "../db/db";
import { generateServerGameCode } from "./utils";

type SetLastMutationIdArgs = {
	clientId: string;
	clientGroupId: string;
	mutationId: number;
	version: number;
};

export const setLastMutationId = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ clientGroupId, clientId, mutationId, version }: SetLastMutationIdArgs,
) => {
	const result = await transaction
		.update(ctx.schema.ReplicacheClient)
		.set({ clientGroupId, lastMutationId: mutationId, version })
		.where(eq(ctx.schema.ReplicacheClient.id, clientId))
		.run();

	if (result.rowsAffected === 0) {
		await transaction
			.insert(ctx.schema.ReplicacheClient)
			.values({
				clientGroupId,
				id: clientId,
				lastMutationId: mutationId,
				version,
			})
			.run();
	}
};

type SetLastMutationIdsArgs = {
	clientGroupId: string;
	version: number;
	lastMutationIds: Map<string, number>;
};

export const setLastMutationIds = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ clientGroupId, version, lastMutationIds }: SetLastMutationIdsArgs,
) => {
	await Promise.all(
		Array.from(lastMutationIds.entries()).map(([clientId, mutationId]) =>
			setLastMutationId(ctx, transaction, {
				clientGroupId,
				clientId,
				mutationId,
				version,
			}),
		),
	);
};

type InsertGameArgs = {
	width: number;
	height: number;
	name: string;
	mines: number;
};

export const insertGame = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ height, width, mines, name }: InsertGameArgs,
) => {
	if (!ctx.event.clientAddress) {
		throw new Error("Invalid request");
	}

	const ipHash = await bcrypt.hash(ctx.event.clientAddress, 10);

	return transaction
		.insert(ctx.schema.ReplicacheServer)
		.values({
			id: crypto.randomUUID(),
			code: generateServerGameCode({ height, mines, width }),
			height,
			ipHash,
			mines,
			name,
			width,
			version: 1,
		})
		.returning()
		.get();
};

type UpdateGameVersionArgs = {
	version: number;
	serverId: string;
};

export const updateGameVersion = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ version, serverId }: UpdateGameVersionArgs,
) => {
	await transaction
		.update(ctx.schema.ReplicacheServer)
		.set({ version })
		.where(eq(ctx.schema.ReplicacheServer.id, serverId))
		.run();
};

type SelectLastMutationIdArgs = {
	clientId: string;
};

export const selectLastMutationId = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ clientId }: SelectLastMutationIdArgs,
) => {
	const row = await transaction
		.select()
		.from(ctx.schema.ReplicacheClient)
		.where(eq(ctx.schema.ReplicacheClient.id, clientId))
		.limit(1)
		.get();

	return row ? row.lastMutationId : 0;
};

type SelectLastMutationIdsArgs = {
	clientIds: string[];
};

export const selectLastMutationIds = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ clientIds }: SelectLastMutationIdsArgs,
) => {
	const rows = await transaction
		.select()
		.from(ctx.schema.ReplicacheClient)
		.where(inArray(ctx.schema.ReplicacheClient.id, clientIds))
		.all();

	const map = new Map<string, number>();
	rows.forEach((row) => map.set(row.id, row.lastMutationId));

	const lastIds = new Map<string, number>();
	clientIds.forEach((clientId) =>
		lastIds.set(clientId, map.get(clientId) ?? 0),
	);

	return lastIds;
};

type SelectGameVersionArgs = {
	gameId: string;
};

export const selectGameVersion = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ gameId }: SelectGameVersionArgs,
) => {
	const row = await transaction
		.select()
		.from(ctx.schema.ReplicacheServer)
		.where(eq(ctx.schema.ReplicacheServer.id, gameId))
		.limit(1)
		.get();

	return row?.version;
};

type SelectGameArgs = {
	gameId: string;
};

export const selectGame = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ gameId }: SelectGameArgs,
) => {
	const row = await transaction
		.select({
			name: ctx.schema.ReplicacheServer.name,
			width: ctx.schema.ReplicacheServer.width,
			height: ctx.schema.ReplicacheServer.height,
			mines: ctx.schema.ReplicacheServer.mines,
			code: ctx.schema.ReplicacheServer.code,
		})
		.from(ctx.schema.ReplicacheServer)
		.where(eq(ctx.schema.ReplicacheServer.id, gameId))
		.limit(1)
		.get();

	return row;
};

export type SelectGameResult = NonNullable<
	Awaited<ReturnType<typeof selectGame>>
>;

type SelectLastMutationIdChangesArgs = {
	clientGroupId: string;
	fromVersion: number;
};

export const selectLastMutationIdChanges = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ clientGroupId, fromVersion }: SelectLastMutationIdChangesArgs,
) => {
	const rows = await transaction
		.select({
			id: ctx.schema.ReplicacheClient.id,
			lastMutationId: ctx.schema.ReplicacheClient.lastMutationId,
		})
		.from(ctx.schema.ReplicacheClient)
		.where(
			and(
				eq(ctx.schema.ReplicacheClient.clientGroupId, clientGroupId),
				gt(ctx.schema.ReplicacheClient.version, fromVersion),
			),
		)
		.all();

	return Object.fromEntries(rows.map((r) => [r.id, r.lastMutationId]));
};
