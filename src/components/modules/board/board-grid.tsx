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
import { LEFT_BUTTON, RIGHT_BUTTON, getNeighborsPositions } from "./utils";

export const BoardGrid: Component = () => {
	const data = useGameData();
	const rep = useReplicacheContext();

	const { pushedNeighbors, setPushedCell } = createPushedNeighbors();

	const getElementPosition = (target: Element) => {
		const attribute = target.getAttribute(DATA_POSITION_ATTRIBUTE);
		return attribute ? { value: Number(attribute) } : null;
	};

	const onMouseDown: ComponentProps<"div">["onMouseDown"] = (event) => {
		const { uncovered } = data();

		const position = getElementPosition(event.target);
		if (
			position &&
			event.button === LEFT_BUTTON &&
			uncovered().has(position.value)
		) {
			setPushedCell(position.value);
		}
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
		const { game, cellsMap, uncovered } = data();

		setPushedCell(null);

		const position = getElementPosition(event.target);
		if (!position) {
			return;
		}

		const cell = cellsMap().get(position.value);
		const isUncovered = uncovered().has(position.value);

		if (isUncovered) {
			return;
		}

		const common = { position: position.value, gameId: game.id };
		const isMarking = event.button === RIGHT_BUTTON;

		if (cell && isMarking) {
			await rep().mutate.updateCell({
				...common,
				id: cell.id,
				marked: !cell.marked,
				clicked: false,
			});
		} else if (!cell || isMarking) {
			await rep().mutate.insertCell({
				...common,
				id: nanoid(),
				marked: isMarking,
				clicked: !isMarking,
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
						isUncovered={data().uncovered().has(index())}
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
