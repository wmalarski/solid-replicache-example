import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const ReplicacheSpace = sqliteTable("replicache_space", {
	id: text("id").primaryKey().unique().notNull(),
	ipHash: text("ip_hash").notNull().unique(),
	version: integer("version").notNull(),
});

export const ReplicacheClient = sqliteTable("replicache_client", {
	id: text("id", { length: 36 }).primaryKey().unique().notNull(),
	clientGroupId: text("client_group_id", { length: 36 }).notNull(),
	lastMutationId: integer("last_mutation_id").notNull(),
	version: integer("version").notNull(),
});

export const Game = sqliteTable("game", {
	id: text("id").primaryKey().unique().notNull(),
	spaceId: text("space_id")
		.notNull()
		.references(() => ReplicacheSpace.id),
	name: text("name").notNull(),
	width: integer("width").notNull(),
	height: integer("height").notNull(),
	mines: integer("height").notNull(),
	code: text("code").notNull(),
	deleted: integer("deleted", { mode: "boolean" }).notNull(),
	version: integer("version").notNull(),
	startedAt: integer("started_at"),
});

export const Cell = sqliteTable("cell", {
	id: text("id").primaryKey().unique().notNull(),
	gameId: text("game_id")
		.notNull()
		.references(() => Game.id),
	marked: integer("marked", { mode: "boolean" }).notNull(),
	clicked: integer("clicked", { mode: "boolean" }).notNull(),
	deleted: integer("deleted", { mode: "boolean" }).notNull(),
	version: integer("version").notNull(),
});
