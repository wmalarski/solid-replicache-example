import { type Component, For, createMemo } from "solid-js";
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

	const uncovered = createMemo(() => {
		const uncovered = new Set<number>();
		const { cells, config } = game();

		cells.value.forEach((cell) => {
			if (cell.clicked) {
				uncovered.add(cell.position);
				const cellConfig = config.get(cell.position);

				if (!cellConfig?.hasMine) {
					cellConfig?.lake?.forEach((index) => uncovered.add(index));
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
				{(_cellCode, index) => (
					<BoardCell
						position={index()}
						isUncovered={uncovered().has(index())}
					/>
				)}
			</For>
		</Grid>
	);
};
