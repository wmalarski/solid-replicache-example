import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";

try {
	config({ path: ".env.local" });
} catch {
	//
}

const client = createClient({
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	url: process.env.TURSO_CONNECTION_URL!,
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);

export type Transaction =
	| typeof db
	| Parameters<Parameters<typeof db.transaction>[0]>[0];
