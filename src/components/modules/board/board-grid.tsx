import {
	type Component,
	type ComponentProps,
	For,
	createMemo,
	createSignal,
} from "solid-js";
import { Grid } from "~/styled-system/jsx";
import { BoardCell, DATA_POSITION_ATTRIBUTE } from "./board-cell";
import { useGameData } from "./game-provider";
import { getNeighborsPositions } from "./utils";

export const BoardGrid: Component = () => {
	const data = useGameData();

	const [pushedDownCell, setPushedDownCell] = createSignal<number | null>(null);

	const pushedNeighbors = createMemo(() => {
		const { game } = data();
		const index = pushedDownCell();

		if (!index && index !== 0) {
			return new Set<number>();
		}

		return new Set(
			getNeighborsPositions({
				columns: game.width,
				index,
				rows: game.height,
			}),
		);
	});

	const uncovered = createMemo(() => {
		const uncovered = new Set<number>();
		const { cells, configs, minePositions } = data();

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

	const getElementPosition = (target: Element) => {
		const attribute = target.getAttribute(DATA_POSITION_ATTRIBUTE);
		return attribute ? { value: Number(attribute) } : null;
	};

	const onMouseDown: ComponentProps<"div">["onMouseDown"] = (event) => {
		const position = getElementPosition(event.target);
		if (!position) {
			return;
		}
		setPushedDownCell(position.value);
	};

	const onMouseUp: ComponentProps<"div">["onMouseUp"] = () => {
		setPushedDownCell(null);
	};

	return (
		<Grid
			onContextMenu={(e) => e.preventDefault()}
			style={{ "grid-template-columns": `repeat(${data().game.width}, 1fr)` }}
			width="fit-content"
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			gap={0}
		>
			<For each={[...data().game.code]}>
				{(_cellCode, index) => (
					<BoardCell
						position={index()}
						isUncovered={uncovered().has(index())}
						isPushed={pushedNeighbors().has(index())}
					/>
				)}
			</For>
		</Grid>
	);
};
