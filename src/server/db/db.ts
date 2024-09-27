import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const client = createClient({
	url: "file:./drizzle/db.sqlite",
});

export const db = drizzle(client);

export type Transaction =
	| typeof db
	| Parameters<Parameters<typeof db.transaction>[0]>[0];
