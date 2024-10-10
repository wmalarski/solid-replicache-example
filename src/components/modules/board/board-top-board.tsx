import { createWritableMemo } from "@solid-primitives/memo";
import {
	type Component,
	type ParentProps,
	createEffect,
	createMemo,
	onCleanup,
} from "solid-js";
import { Grid } from "~/styled-system/jsx";
import { flex } from "~/styled-system/patterns";
import { useGameData } from "./game-provider";
import { RestartGameDialog } from "./restart-game-dialog";

export const BoardTopBar: Component = () => {
	return (
		<Grid
			gridTemplateColumns={3}
			gap={4}
			alignItems="center"
			marginX="auto"
			padding={2}
		>
			<MinesLeftCounter />
			<RestartGameDialog />
			<SecondsCounter />
		</Grid>
	);
};

const formatMsDifference = (ms: number) => {
	return Math.floor(ms / 1000);
};

const SecondsCounter: Component = () => {
	const data = useGameData();

	const [counter, setCounter] = createWritableMemo(() => {
		const { game } = data();
		const startedAt = game.startedAt;

		if (!startedAt) {
			return 0;
		}

		const now = new Date().getTime();
		return formatMsDifference(now - startedAt);
	});

	createEffect(() => {
		const { game, isSuccess } = data();
		const startedAt = game.startedAt;
		if (!startedAt || isSuccess()) {
			return;
		}

		const timeout = setInterval(() => {
			const now = new Date().getTime();
			setCounter(formatMsDifference(now - startedAt));
		}, 1000);

		onCleanup(() => {
			clearTimeout(timeout);
		});
	});

	return <CounterText>{counter()}</CounterText>;
};

const MinesLeftCounter: Component = () => {
	const data = useGameData();

	const minesNotMarked = createMemo(() => {
		const { minePositions, positionsMarked } = data();
		return minePositions.size - positionsMarked().size;
	});

	return <CounterText>{minesNotMarked()}</CounterText>;
};

const CounterText: Component<ParentProps> = (props) => {
	return (
		<span
			class={flex({
				fontFamily: "monospace",
				fontSize: "xl",
				backgroundColor: "gray.2",
				alignItems: "center",
				padding: 2,
				justifyContent: "center",
			})}
		>
			{props.children}
		</span>
	);
};
