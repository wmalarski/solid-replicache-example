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
import { LEFT_BUTTON, RIGHT_BUTTON } from "./utils";

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
		const { game, cells, uncovered, configs } = data();

		const pushed = pushedCell();
		const { covered, marked } = pushedNeighbors();

		setPushedCell(null);

		if (!pushed) {
			return;
		}

		const cell = cells.value.find((cell) => cell.position === pushed.position);
		const isUncovered = uncovered().has(pushed.position);

		if (isUncovered) {
			const count = configs.get(pushed.position)?.count ?? 0;
			if (marked.size === count) {
			}

			console.log("isUncovered", {
				isUncovered,
				marked: Array.from(marked),
				covered: Array.from(covered),
				count,
			});

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
						isPushed={pushedNeighbors().covered.has(index())}
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
		const { positionsMarked, uncovered, configs } = data();
		const cell = pushedCell();
		const marked = new Set<number>();
		const covered = new Set<number>();

		if (
			!cell ||
			!uncovered().has(cell.position) ||
			cell.button !== LEFT_BUTTON
		) {
			return { marked, covered };
		}

		const config = configs.get(cell.position);

		config?.neighbors.forEach((neighbor) => {
			const isMarked = positionsMarked().has(neighbor);
			const isUncovered = uncovered().has(neighbor);
			isMarked && marked.add(neighbor);
			!isUncovered && !isMarked && covered.add(neighbor);
		});

		return { marked, covered };
	});

	return { pushedCell, pushedNeighbors, setPushedCell };
};
