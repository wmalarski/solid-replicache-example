import { createClient } from "@libsql/client";
import { config } from 'dotenv';
import { drizzle } from "drizzle-orm/libsql";

config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);

export type Transaction =
	| typeof db
	| Parameters<Parameters<typeof db.transaction>[0]>[0];
