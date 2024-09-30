import type { APIEvent } from "@solidjs/start/server";
import type { PatchOperation, PullRequestV1, PullResponse } from "replicache";
import { getServerContext } from "~/server/context";
import { selectMessages } from "~/server/messages/db";
import {
	selectLastMutationIdChanges,
	selectServerVersion,
} from "~/server/replicache/db";

export const POST = async (event: APIEvent) => {
	const ctx = getServerContext(event);

	const serverId = event.params.serverId;
	const pull: PullRequestV1 = await event.request.json();

	console.log("Processing pull", JSON.stringify(pull));

	const { clientGroupID: clientGroupId } = pull;
	const fromVersion = Number(pull.cookie ?? 0);
	const t0 = Date.now();

	try {
		// Read all data in a single transaction so it's consistent.
		const result = await ctx.db.transaction(async (transaction) => {
			// Get current version.
			const currentVersion = await selectServerVersion(ctx, transaction, {
				serverId,
			});

			if (!currentVersion || fromVersion > currentVersion) {
				throw new Error(
					`fromVersion ${fromVersion} is from the future - aborting. This can happen in development if the server restarts. In that case, clear appliation data in browser and refresh.`,
				);
			}

			// Get lmids for requesting client groups.
			const lastMutationIDChanges = await selectLastMutationIdChanges(
				ctx,
				transaction,
				{ clientGroupId, fromVersion },
			);

			// Get changed domain objects since requested version.
			const changed = await selectMessages(ctx, transaction, { fromVersion });

			// Build and return response.
			const patch: PatchOperation[] = [];

			for (const row of changed) {
				const { id, sender, content, ord, version: rowVersion, deleted } = row;
				if (deleted) {
					if (rowVersion > fromVersion) {
						patch.push({
							op: "del",
							key: `message/${id}`,
						});
					}
				} else {
					patch.push({
						op: "put",
						key: `message/${id}`,
						value: {
							from: sender,
							content,
							order: ord,
						},
					});
				}
			}

			const body: PullResponse = {
				lastMutationIDChanges: lastMutationIDChanges ?? {},
				cookie: currentVersion,
				patch,
			};

			return body;
		});

		return result;
	} catch (error) {
		console.error(error);

		return new Response(String(error), { status: 500 });
	} finally {
		console.log("Processed pull in", Date.now() - t0);
	}
};
