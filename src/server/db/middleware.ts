import type { FetchEvent } from "@solidjs/start/server";

import { type Transaction, getDrizzle } from "./db";

const globalForDb = globalThis as unknown as {
	client: Transaction | undefined;
};

export const dbMiddleware = async (event: FetchEvent) => {
	const db = globalForDb.client ?? getDrizzle();

	if (process.env.NODE_ENV !== "production") {
		globalForDb.client = db;
	}

	event.locals.db = db;
};

declare module "@solidjs/start/server" {
	interface RequestEventLocals {
		db: Transaction;
	}
}
