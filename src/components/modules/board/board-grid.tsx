import { type Component, For, createMemo } from "solid-js";
import { Grid } from "~/styled-system/jsx";
import { BoardCell } from "./board-cell";
import { useGameData } from "./game-provider";

export const BoardGrid: Component = () => {
	const game = useGameData();

	const uncovered = createMemo(() => {
		const uncovered = new Set<number>();
		const { cells, configs, minePositions } = game();

		let clickedOnMine = false;

		cells.value.forEach((cell) => {
			if (cell.clicked) {
				uncovered.add(cell.position);
				const cellConfig = configs.get(cell.position);

				if (cellConfig?.hasMine) {
					clickedOnMine = true;
				} else {
					cellConfig?.lake?.forEach((index) => uncovered.add(index));
				}
			}
		});

		if (clickedOnMine) {
			minePositions.forEach((position) => uncovered.add(position));
		}

		return uncovered;
	});

	return (
		<Grid
			onContextMenu={(e) => e.preventDefault()}
			style={{ "grid-template-columns": `repeat(${game().game.width}, 1fr)` }}
			width="fit-content"
			gap={0}
		>
			<For each={[...game().game.code]}>
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
