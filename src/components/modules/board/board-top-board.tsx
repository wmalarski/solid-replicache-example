import {
	type Component,
	Show,
	createMemo,
	createSignal,
	onCleanup,
} from "solid-js";
import { HStack } from "~/styled-system/jsx";
import { useGameData } from "./game-provider";
import { RestartGameDialog } from "./restart-game-dialog";

export const BoardTopBar: Component = () => {
	return (
		<HStack>
			<MinesLeftCounter />
			<RestartGameDialog />
			<SecondsCounter />
		</HStack>
	);
};

const formatMsDifference = (ms: number) => {
	return Math.floor(ms / 1000);
};

const SecondsCounter: Component = () => {
	const data = useGameData();

	return (
		<Show when={data().game.startedAt} fallback={<span>0</span>}>
			{(startedAt) => {
				const [counter, setCounter] = createSignal(0);

				const timeout = setTimeout(() => {
					const now = new Date().getTime();
					setCounter(formatMsDifference(now - startedAt()));
				}, 1000);

				onCleanup(() => {
					clearTimeout(timeout);
				});

				return <span>{counter()}</span>;
			}}
		</Show>
	);
};

const MinesLeftCounter: Component = () => {
	const data = useGameData();

	const minesMarked = createMemo(() => {
		const { cells, minePositions } = data();
		const marked = cells.value.filter((cell) => cell.marked).length;
		return minePositions.size - marked;
	});

	return <span>{minesMarked()}</span>;
};
