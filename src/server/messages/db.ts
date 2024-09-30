"use server";
import { gt } from "drizzle-orm";
import type { ServerContext } from "../context";
import type { Transaction } from "../db/db";
import type { MessageWithID } from "./types";

type InsertMessageArgs = MessageWithID & {
	version: number;
};

export const insertMessage = (
	ctx: ServerContext,
	transaction: Transaction,
	{ content, from, id, order, version }: InsertMessageArgs,
) => {
	return transaction.insert(ctx.schema.Message).values({
		id,
		content,
		deleted: false,
		ord: order,
		sender: from,
		version,
	});
};

type SelectMessagesArgs = {
	fromVersion: number;
};

export const selectMessages = (
	ctx: ServerContext,
	transaction: Transaction,
	{ fromVersion }: SelectMessagesArgs,
) => {
	return transaction
		.select()
		.from(ctx.schema.Message)
		.where(gt(ctx.schema.Message.version, fromVersion))
		.all();
};
