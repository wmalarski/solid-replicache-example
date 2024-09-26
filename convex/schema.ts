import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	replicache_server: defineTable({
		version: v.number(),
	}),
	message: defineTable({
		sender: v.string(),
		content: v.string(),
		ord: v.number(),
		deleted: v.boolean(),
		version: v.number(),
	}),
	replicache_client: defineTable({
		client_group_id: v.string(),
		last_mutation_id: v.number(),
		version: v.number(),
	}),
});
