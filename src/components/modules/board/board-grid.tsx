import { type Component, For, createMemo } from "solid-js";
import type { GameCell } from "~/server/cells/types";
import type { SelectGameResult } from "~/server/replicache/db";
import { Grid } from "~/styled-system/jsx";
import { BoardCell } from "./board-cell";
import { useGameData } from "./game-provider";

type BoardGridProps = {
	gameId: string;
	game: SelectGameResult;
};

export const BoardGrid: Component<BoardGridProps> = (props) => {
	const game = useGameData();

	const cellsMap = createMemo(() => {
		const cellsMap = new Map<number, GameCell>();
		game().cells.value.forEach((gameCell) =>
			cellsMap.set(gameCell.position, gameCell),
		);
		return cellsMap;
	});

	const uncovered = createMemo(() => {
		const uncovered = new Set<number>();

		game().cells.value.forEach((gameCell) => {
			if (gameCell.clicked) {
				uncovered.add(gameCell.position);
				const cellInfo = game().config.get(gameCell.position);

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
						cellInfo={game().config.get(index())}
						isUncovered={uncovered().has(index())}
					/>
				)}
			</For>
		</Grid>
	);
};
