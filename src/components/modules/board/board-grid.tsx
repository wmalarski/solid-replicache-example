import { nanoid } from "nanoid";
import {
	type Component,
	type ComponentProps,
	For,
	createMemo,
	createSignal,
} from "solid-js";
import { useReplicacheContext } from "~/components/contexts/replicache";
import { Grid } from "~/styled-system/jsx";
import { BoardCell, DATA_POSITION_ATTRIBUTE } from "./board-cell";
import { useGameData } from "./game-provider";
import { RIGHT_BUTTON, getNeighborsPositions, getUncovered } from "./utils";

export const BoardGrid: Component = () => {
	const data = useGameData();
	const rep = useReplicacheContext();

	const { pushedNeighbors, setPushedCell } = createPushedNeighbors();

	const uncovered = createMemo(() => getUncovered(data()));

	const getElementPosition = (target: Element) => {
		const attribute = target.getAttribute(DATA_POSITION_ATTRIBUTE);
		return attribute ? { value: Number(attribute) } : null;
	};

	const onMouseDown: ComponentProps<"div">["onMouseDown"] = (event) => {
		const position = getElementPosition(event.target);
		if (!position) {
			return;
		}
		setPushedCell(position.value);
	};

	const updateStartedAt = async () => {
		const { game } = data();

		if (game.startedAt) {
			return;
		}

		await rep().mutate.updateGame({
			...game,
			startedAt: new Date().getTime(),
		});
	};

	const onMouseUp: ComponentProps<"div">["onMouseUp"] = async (event) => {
		const { game, cellsMap } = data();

		setPushedCell(null);

		const position = getElementPosition(event.target);
		if (!position) {
			return;
		}

		const cell = cellsMap().get(position.value);

		if (cell?.clicked) {
			return;
		}

		const common = { position: position.value, gameId: game.id };

		if (cell && event.button === RIGHT_BUTTON) {
			await rep().mutate.updateCell({
				...common,
				id: cell.id,
				marked: !cell.marked,
				clicked: false,
			});
		} else if (!cell || event.button === RIGHT_BUTTON) {
			await rep().mutate.insertCell({
				...common,
				id: nanoid(),
				marked: event.button === RIGHT_BUTTON,
				clicked: event.button !== RIGHT_BUTTON,
			});
		}

		await updateStartedAt();
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

export const createPushedNeighbors = () => {
	const data = useGameData();

	const [pushedCell, setPushedCell] = createSignal<number | null>(null);

	const pushedNeighbors = createMemo(() => {
		const { game } = data();
		const index = pushedCell();

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

	return { pushedCell, pushedNeighbors, setPushedCell };
};
