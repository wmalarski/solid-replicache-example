import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const ReplicacheServer = sqliteTable("replicache_server", {
	id: text("id").primaryKey().unique().notNull(),
	version: integer("version"),
	name: text("name").notNull(),
	width: integer("width").notNull(),
	height: integer("height").notNull(),
	mines: integer("height").notNull(),
	code: text("code").notNull(),
	ipHash: text("ip_hash").notNull().unique(),
});

export const ReplicacheClient = sqliteTable("replicache_client", {
	id: text("id", { length: 36 }).primaryKey().unique().notNull(),
	clientGroupId: text("client_group_id", { length: 36 }).notNull(),
	lastMutationId: integer("last_mutation_id").notNull(),
	version: integer("version").notNull(),
});

export const Cell = sqliteTable("cell", {
	id: text("id").primaryKey().unique().notNull(),
	gameId: text("game_id").notNull(),
	positionX: integer("position_x").notNull(),
	positionY: integer("position_y").notNull(),
	marked: integer("marked", { mode: "boolean" }).notNull(),
	clicked: integer("clicked", { mode: "boolean" }).notNull(),
	deleted: integer("deleted", { mode: "boolean" }).notNull(),
	version: integer("version").notNull(),
});
