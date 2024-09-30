"use server";
import { redirect } from "@solidjs/router";
import bcrypt from "bcryptjs";
import { decode } from "decode-formdata";
import { and, eq, gt } from "drizzle-orm";
import * as v from "valibot";
import { paths } from "~/utils/paths";
import { type ServerContext, getServerContext } from "../context";
import type { Transaction } from "../db/db";
import { getRequestEventOrThrow, rpcParseIssueResult } from "../utils";
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

const insertGame = async (
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

export const insertGameServerAction = async (formData: FormData) => {
	const parsed = await v.safeParseAsync(
		v.object({
			width: v.number(),
			height: v.number(),
			name: v.string(),
			mines: v.number(),
		}),
		decode(formData, { numbers: ["rows", "columns", "height", "width"] }),
	);

	if (!parsed.success) {
		return rpcParseIssueResult(parsed.issues);
	}

	const event = getRequestEventOrThrow();
	const ctx = getServerContext(event);

	const game = await insertGame(ctx, ctx.db, parsed.output);

	throw redirect(paths.game(game.id));
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
