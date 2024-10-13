import {
	type Component,
	type ComponentProps,
	For,
	createMemo,
	createSignal,
} from "solid-js";
import { useReplicacheContext } from "~/components/contexts/replicache";
import { Grid } from "~/styled-system/jsx";
import { usePlayerCursors } from "../realtime/cursor-provider";
import { RemoteCursors } from "../realtime/remote-cursors";
import { BoardCell, DATA_POSITION_ATTRIBUTE } from "./board-cell";
import { useGameData } from "./game-provider";
import { LEFT_BUTTON, RIGHT_BUTTON } from "./utils";

export const BoardGrid: Component = () => {
	const data = useGameData();
	const rep = useReplicacheContext();
	const cursors = usePlayerCursors();

	const { pushedNeighbors, setPushedCell, pushedCell } =
		createPushedNeighbors();

	const onMouseDown: ComponentProps<"div">["onMouseDown"] = (event) => {
		const { clickedOnMine, isSuccess } = data();

		if (clickedOnMine() || isSuccess()) {
			return;
		}

		const attribute = event.target
			.closest(`[${DATA_POSITION_ATTRIBUTE}]`)
			?.getAttribute(DATA_POSITION_ATTRIBUTE);

		const position = attribute
			? { position: attribute, button: event.button }
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

	const updateCell = async (position: string, isMarking: boolean) => {
		const { game, cells } = data();
		const cell = cells.value.find((cell) => cell.id === position);
		const common = { id: position, clicked: !isMarking, gameId: game.id };

		if (cell) {
			const marked = isMarking ? !cell.marked : false;
			await rep().mutate.updateCell({ ...common, marked });
			return;
		}
		await rep().mutate.insertCell({ ...common, marked: isMarking });
	};

	const onMouseUp: ComponentProps<"div">["onMouseUp"] = async () => {
		const { uncovered, configs } = data();

		const { covered, marked } = pushedNeighbors();
		const pushed = pushedCell();
		setPushedCell(null);

		if (!pushed) {
			return;
		}

		if (uncovered().has(pushed.position)) {
			const count = configs.get(pushed.position)?.count ?? 0;

			if (marked.size === count) {
				for (const position of covered) {
					await updateCell(position, false);
				}
			}
			return;
		}

		await updateCell(pushed.position, pushed.button === RIGHT_BUTTON);
		await updateStartedAt();
	};

	const onContextMenu: ComponentProps<"div">["onContextMenu"] = (event) => {
		event.preventDefault();
	};

	const onMouseMove: ComponentProps<"div">["onMouseMove"] = (event) => {
		cursors().send({ x: event.layerX, y: event.layerY });
	};

	return (
		<Grid
			onContextMenu={onContextMenu}
			onMouseMove={onMouseMove}
			style={{ "grid-template-columns": `repeat(${data().game.width}, 1fr)` }}
			width="fit-content"
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			position="relative"
			gap={0}
			mx="auto"
			p={2}
		>
			<For each={data().positions}>
				{(position) => (
					<BoardCell
						position={position}
						isPushed={pushedNeighbors().covered.has(position)}
					/>
				)}
			</For>
			<RemoteCursors />
		</Grid>
	);
};

type PushedCell = {
	position: string;
	button: number;
};

const createPushedNeighbors = () => {
	const data = useGameData();

	const [pushedCell, setPushedCell] = createSignal<PushedCell | null>(null);

	const pushedNeighbors = createMemo(() => {
		const { positionsMarked, uncovered, configs } = data();
		const cell = pushedCell();
		const marked = new Set<string>();
		const covered = new Set<string>();

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
