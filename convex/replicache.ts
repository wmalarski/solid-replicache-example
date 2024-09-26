import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const selectServerVersion = query({
	args: { serverId: v.id("replicache_server") },
	async handler(ctx, args) {
		const entry = await ctx.db.get(args.serverId);
		return entry?.version;
	},
});

export const updateServerVersion = mutation({
	args: { serverId: v.id("replicache_server"), version: v.number() },
	handler(ctx, args) {
		return ctx.db.patch(args.serverId, { version: args.version });
	},
});

export const selectLastMutationId = query({
	args: { clientId: v.id("replicache_client") },
	async handler(ctx, args) {
		const entry = await ctx.db.get(args.clientId);
		return entry?.last_mutation_id;
	},
});

export const updateClientMutation = mutation({
	args: {
		clientId: v.id("replicache_client"),
		clientGroupId: v.string(),
		lastMutationId: v.number(),
		version: v.number(),
	},
	async handler(ctx, args) {
		return ctx.db.patch(args.clientId, {
			version: args.version,
			client_group_id: args.clientGroupId,
			last_mutation_id: args.lastMutationId,
		});
	},
});
