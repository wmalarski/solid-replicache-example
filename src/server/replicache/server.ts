"use server";
import { eq } from "drizzle-orm";
import type { ServerContext } from "../context";
import type { Transaction } from "../db/db";

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

type UpdateServerVersionArgs = {
	version: number;
	serverId: number;
};

export const updateServerVersion = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ version, serverId }: UpdateServerVersionArgs,
) => {
	await transaction
		.update(ctx.schema.ReplicacheServer)
		.set({ version })
		.where(eq(ctx.schema.ReplicacheServer.id, serverId))
		.run();
};

type GetLastMutationIdArgs = {
	clientId: string;
};

export const getLastMutationId = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ clientId }: GetLastMutationIdArgs,
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
	serverId: number;
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
