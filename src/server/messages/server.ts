"use server";
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
