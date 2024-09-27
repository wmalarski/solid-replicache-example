import Database from "better-sqlite3";
import {
	type BetterSQLite3Database,
	drizzle,
} from "drizzle-orm/better-sqlite3";

const sqlite = new Database("./drizzle/db.sqlite");

export const db: BetterSQLite3Database = drizzle(sqlite);

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
