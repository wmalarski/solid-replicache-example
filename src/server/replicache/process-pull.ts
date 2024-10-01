import type { PatchOperation, PullRequestV1, PullResponse } from "replicache";
import { selectMessages } from "~/server/messages/db";
import {
	selectGameVersion,
	selectLastMutationIdChanges,
} from "~/server/replicache/db";
import type { ServerContext } from "../context";
import type { Transaction } from "../db/db";

type ProcessPullArgs = {
	gameId: string;
	pull: PullRequestV1;
};

export const processPull = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ gameId, pull }: ProcessPullArgs,
) => {
	const fromVersion = Number(pull.cookie ?? 0);

	// Get current version.
	const [currentVersion, lastMutationIdChanges, changed] = await Promise.all([
		selectGameVersion(ctx, transaction, { gameId }),
		selectLastMutationIdChanges(ctx, transaction, {
			clientGroupId: pull.clientGroupID,
			fromVersion,
		}),
		selectMessages(ctx, transaction, { fromVersion }),
	]);

	if (!currentVersion || fromVersion > currentVersion) {
		throw new Error(
			`fromVersion ${fromVersion} is from the future - aborting. This can happen in development if the server restarts. In that case, clear appliation data in browser and refresh.`,
		);
	}

	// Build and return response.
	const patch: PatchOperation[] = [];

	for (const row of changed) {
		const { id, sender, content, ord, version: rowVersion, deleted } = row;
		if (deleted) {
			if (rowVersion > fromVersion) {
				patch.push({ op: "del", key: `message/${id}` });
			}
		} else {
			patch.push({
				op: "put",
				key: `message/${id}`,
				value: { from: sender, content, order: ord },
			});
		}
	}

	const body: PullResponse = {
		lastMutationIDChanges: lastMutationIdChanges ?? {},
		cookie: currentVersion,
		patch,
	};

	return body;
};
