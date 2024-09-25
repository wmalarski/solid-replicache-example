import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	replicache_server: defineTable({
		version: v.int64(),
	}),
	message: defineTable({
		sender: v.string(),
		content: v.string(),
		ord: v.int64(),
		deleted: v.boolean(),
		version: v.int64(),
	}),
	replicache_client: defineTable({
		client_group_id: v.string(),
		last_mutation_id: v.int64(),
		version: v.int64(),
	}),
});
