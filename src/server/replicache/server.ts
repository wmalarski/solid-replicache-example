"use server";
import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { ServerContext } from "../context";

type SetLastMutationIdArgs = {
	clientId: string;
	clientGroupId: string;
	mutationId: number;
	version: number;
};

export const setLastMutationId = (
	ctx: ServerContext,
	transaction: BetterSQLite3Database,
	{ clientGroupId, clientId, mutationId, version }: SetLastMutationIdArgs,
) => {
	const result = transaction
		.update(ctx.schema.ReplicacheClient)
		.set({ clientGroupId, lastMutationId: mutationId, version })
		.where(eq(ctx.schema.ReplicacheClient.id, clientId))
		.run();

	if (result.changes === 0) {
		transaction
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

export const updateServerVersion = (
	ctx: ServerContext,
	transaction: BetterSQLite3Database,
	{ version, serverId }: UpdateServerVersionArgs,
) => {
	transaction
		.update(ctx.schema.ReplicacheServer)
		.set({ version })
		.where(eq(ctx.schema.ReplicacheServer.id, serverId))
		.run();
};

type GetLastMutationIdArgs = {
	clientId: string;
};

export const getLastMutationId = (
	ctx: ServerContext,
	transaction: BetterSQLite3Database,
	{ clientId }: GetLastMutationIdArgs,
) => {
	const row = transaction
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

export const selectServerVersion = (
	ctx: ServerContext,
	transaction: BetterSQLite3Database,
	{ serverId }: SelectServerVersionArgs,
) => {
	const row = transaction
		.select()
		.from(ctx.schema.ReplicacheServer)
		.where(eq(ctx.schema.ReplicacheServer.id, serverId))
		.limit(1)
		.get();

	return row?.version;
};
