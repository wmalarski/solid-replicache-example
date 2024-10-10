import {
	type Component,
	Show,
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
} from "solid-js";
import { HStack } from "~/styled-system/jsx";
import { useGameData } from "./game-provider";
import { RestartGameDialog } from "./restart-game-dialog";

export const BoardTopBar: Component = () => {
	return (
		<HStack justifyContent="center" gap={4}>
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

	createEffect(() => {
		console.log("data().game", data().game, data().game.startedAt);
	});

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

	const minesNotMarked = createMemo(() => {
		const { minePositions, positionsMarked } = data();
		return minePositions.size - positionsMarked().size;
	});

	return <span>{minesNotMarked()}</span>;
};
