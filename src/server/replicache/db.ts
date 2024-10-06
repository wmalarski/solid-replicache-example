"use server";
import bcrypt from "bcryptjs";
import { and, eq, gt, inArray } from "drizzle-orm";
import type { ServerContext } from "../context";
import type { Transaction } from "../db/db";

export const insertSpace = async (
	ctx: ServerContext,
	transaction: Transaction,
) => {
	if (!ctx.event.clientAddress) {
		throw new Error("Invalid request");
	}

	const ipHash = await bcrypt.hash(ctx.event.clientAddress, 10);

	return transaction
		.insert(ctx.schema.ReplicacheSpace)
		.values({ id: crypto.randomUUID(), ipHash, version: 1 })
		.returning()
		.get();
};

type UpdateSpaceVersionArgs = {
	version: number;
	spaceId: string;
};

export const updateSpaceVersion = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ version, spaceId }: UpdateSpaceVersionArgs,
) => {
	await transaction
		.update(ctx.schema.ReplicacheSpace)
		.set({ version })
		.where(eq(ctx.schema.ReplicacheSpace.id, spaceId))
		.run();
};

type SelectSpaceVersionArgs = {
	spaceId: string;
};

export const selectSpaceVersion = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ spaceId }: SelectSpaceVersionArgs,
) => {
	const row = await transaction
		.select()
		.from(ctx.schema.ReplicacheSpace)
		.where(eq(ctx.schema.ReplicacheSpace.id, spaceId))
		.limit(1)
		.get();

	return row?.version;
};

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
