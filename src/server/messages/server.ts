"use server";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { ServerContext } from "../context";
import type { MessageWithID } from "./types";

type InsertMessageArgs = MessageWithID & {
	version: number;
};

export const insertMessage = (
	ctx: ServerContext,
	transaction: BetterSQLite3Database,
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
