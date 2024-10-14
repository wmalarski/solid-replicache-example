import { createClient } from "@libsql/client";
import type { FetchEvent } from "@solidjs/start/server";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";

export const getDrizzle = (event: FetchEvent) => {
	try {
		config({ path: ".env.local" });
	} catch {
		//
	}

	const url =
		process.env.TURSO_CONNECTION_URL ||
		import.meta.env.TURSO_CONNECTION_URL ||
		event.nativeEvent.context.cloudflare.env.TURSO_CONNECTION_URL;

	const authToken =
		process.env.TURSO_AUTH_TOKEN ||
		import.meta.env.TURSO_AUTH_TOKEN ||
		event.nativeEvent.context.cloudflare.env.TURSO_AUTH_TOKEN;

	const client = createClient({ url, authToken });

	return drizzle(client);
};

type Db = ReturnType<typeof getDrizzle>;

export type Transaction = Db | Parameters<Parameters<Db["transaction"]>[0]>[0];
