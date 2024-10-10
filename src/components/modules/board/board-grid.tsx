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

	const { pushedNeighbors, setPushedCell, pushedCell } =
		createPushedNeighbors();

	const onMouseDown: ComponentProps<"div">["onMouseDown"] = (event) => {
		const { clickedOnMine } = data();

		if (clickedOnMine()) {
			return;
		}

		const attribute = event.target
			.closest(`[${DATA_POSITION_ATTRIBUTE}]`)
			?.getAttribute(DATA_POSITION_ATTRIBUTE);

		const position = attribute
			? { position: Number(attribute), button: event.button }
			: null;

		setPushedCell(position);
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

	const onMouseUp: ComponentProps<"div">["onMouseUp"] = async () => {
		const { game, cells, uncovered } = data();

		const pushed = pushedCell();
		setPushedCell(null);

		if (!pushed) {
			return;
		}

		const cell = cells.value.find((cell) => cell.position === pushed.position);
		const isUncovered = uncovered().has(pushed.position);

		console.log("isUncovered", isUncovered);

		if (isUncovered) {
			// const neighbors = pushedNeighbors()

			return;
		}

		const common = { position: pushed.position, gameId: game.id };
		const isMarking = pushed.button === RIGHT_BUTTON;

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
						isPushed={pushedNeighbors().has(index())}
					/>
				)}
			</For>
		</Grid>
	);
};

type PushedCell = {
	position: number;
	button: number;
};

const createPushedNeighbors = () => {
	const data = useGameData();

	const [pushedCell, setPushedCell] = createSignal<PushedCell | null>(null);

	const pushedNeighbors = createMemo(() => {
		const { game, positionsMarked, uncovered } = data();
		const cell = pushedCell();

		if (
			!cell ||
			!uncovered().has(cell.position) ||
			cell.button !== LEFT_BUTTON
		) {
			return new Set<number>();
		}

		return new Set(
			getNeighborsPositions({
				columns: game.width,
				index: cell.position,
				rows: game.height,
			}).filter((position) => !positionsMarked().has(position)),
		);
	});

	return { pushedCell, pushedNeighbors, setPushedCell };
};
