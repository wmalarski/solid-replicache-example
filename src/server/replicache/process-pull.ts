import type { PatchOperation, PullRequestV1, PullResponse } from "replicache";
import { selectCells } from "~/server/cells/db";
import {
	selectLastMutationIdChanges,
	selectSpaceVersion,
} from "~/server/replicache/db";
import type { ServerContext } from "../context";
import type { Transaction } from "../db/db";
import { selectGames } from "../games/db";
import { getGameCellKey, getGameKey, parseCellId } from "./utils";

type ProcessPullArgs = {
	spaceId: string;
	pull: PullRequestV1;
};

export const processPull = async (
	ctx: ServerContext,
	transaction: Transaction,
	{ spaceId, pull }: ProcessPullArgs,
) => {
	const fromVersion = Number(pull.cookie ?? 0);

	// Get current version.
	const [currentVersion, lastMutationIdChanges, changedCells, changedGames] =
		await Promise.all([
			selectSpaceVersion(ctx, transaction, { spaceId }),
			selectLastMutationIdChanges(ctx, transaction, {
				clientGroupId: pull.clientGroupID,
				fromVersion,
			}),
			selectCells(ctx, transaction, { fromVersion, spaceId }),
			selectGames(ctx, transaction, { fromVersion, spaceId }),
		]);

	if (!currentVersion || fromVersion > currentVersion) {
		throw new Error(
			`fromVersion ${fromVersion} is from the future - aborting. This can happen in development if the server restarts. In that case, clear appliation data in browser and refresh.`,
		);
	}

	// Build and return response.
	const patch: PatchOperation[] = [];

	for (const row of changedCells) {
		const { version: rowVersion, deleted, ...args } = row.cell;

		const { gameId, position } = parseCellId(row.cell.id);
		const key = getGameCellKey(spaceId, gameId, position);

		if (deleted) {
			if (rowVersion > fromVersion) {
				patch.push({ op: "del", key });
			}
		} else {
			patch.push({ op: "put", key, value: args });
		}
	}

	for (const row of changedGames) {
		const { version: rowVersion, deleted, ...args } = row;

		const key = getGameKey(row.spaceId, row.id);

		if (deleted) {
			if (rowVersion > fromVersion) {
				patch.push({ op: "del", key });
			}
		} else {
			patch.push({ op: "put", key, value: args });
		}
	}

	const body: PullResponse = {
		lastMutationIDChanges: lastMutationIdChanges ?? {},
		cookie: currentVersion,
		patch,
	};

	return body;
};
