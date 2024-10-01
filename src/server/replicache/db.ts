"use server";
import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
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

type selectLastMutationIdArgs = {
	clientId: string;
};

export const selectLastMutationId = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ clientId }: selectLastMutationIdArgs,
) => {
	const row = await transaction
		.select()
		.from(ctx.schema.ReplicacheClient)
		.where(eq(ctx.schema.ReplicacheClient.id, clientId))
		.limit(1)
		.get();

	return row ? row.lastMutationId : 0;
};

type SelectServerVersionArgs = {
	serverId: string;
};

export const selectServerVersion = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ serverId }: SelectServerVersionArgs,
) => {
	const row = await transaction
		.select()
		.from(ctx.schema.ReplicacheServer)
		.where(eq(ctx.schema.ReplicacheServer.id, serverId))
		.limit(1)
		.get();

	return row?.version;
};

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
