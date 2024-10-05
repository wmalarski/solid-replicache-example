import { type Component, For, createMemo } from "solid-js";
import { createSubscription } from "~/components/contexts/replicache";
import type { GameCell } from "~/server/cells/types";
import type { SelectGameResult } from "~/server/replicache/db";
import { getGameKey } from "~/server/replicache/utils";
import { Grid } from "~/styled-system/jsx";
import { BoardCell } from "./board-cell";
import { getCellInfos } from "./utils";

type BoardGridProps = {
	gameId: string;
	game: SelectGameResult;
};

export const BoardGrid: Component<BoardGridProps> = (props) => {
	const cellInfos = createMemo(() => {
		return getCellInfos({
			cellCodes: props.game.code.split(""),
			columns: props.game.width,
			rows: Math.floor(props.game.code.length / props.game.width),
		});
	});

	const gameCells = createSubscription(async (tx) => {
		const array = await tx
			.scan<GameCell>({ prefix: getGameKey(props.gameId) })
			.entries()
			.toArray();
		return array.map(([_id, gameCell]) => gameCell);
	}, []);

	const cellsMap = createMemo(() => {
		const cellsMap = new Map<number, GameCell>();
		gameCells.value.forEach((gameCell) =>
			cellsMap.set(gameCell.position, gameCell),
		);
		return cellsMap;
	});

	const uncovered = createMemo(() => {
		const uncovered = new Set<number>();

		gameCells.value.forEach((gameCell) => {
			if (gameCell.clicked) {
				uncovered.add(gameCell.position);
				const cellInfo = cellInfos().get(gameCell.position);

				if (!cellInfo?.hasMine) {
					cellInfo?.lake?.forEach((index) => uncovered.add(index));
				}
			}
		});

		return uncovered;
	});

	return (
		<Grid
			onContextMenu={(e) => e.preventDefault()}
			style={{ "grid-template-columns": `repeat(${props.game.width}, 1fr)` }}
			width="fit-content"
			gap={0}
		>
			<For each={[...props.game.code]}>
				{(cellCode, index) => (
					<BoardCell
						position={index()}
						gameId={props.gameId}
						cellCode={cellCode}
						cellState={cellsMap().get(index())}
						cellInfo={cellInfos().get(index())}
						isUncovered={uncovered().has(index())}
					/>
				)}
			</For>
		</Grid>
	);
};
