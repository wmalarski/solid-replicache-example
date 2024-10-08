import {
	type Component,
	type ParentProps,
	Show,
	createContext,
	createMemo,
	useContext,
} from "solid-js";
import { createSubscription } from "~/components/contexts/replicache";
import type { GameCell } from "~/server/cells/types";
import type { SelectGameResult } from "~/server/games/db";
import { getGameCellsPrefix, getGamePrefix } from "~/server/replicache/utils";
import { CreateGameCard } from "../create-game/create-game-card";
import { getCellInfos, getUncovered } from "./utils";

const createGameData = (game: SelectGameResult) => {
	const { configs, minePositions } = getCellInfos({
		cellCodes: game.code.split(""),
		columns: game.width,
		rows: Math.floor(game.code.length / game.width),
	});

	const cells = createSubscription(async (tx) => {
		const prefix = getGameCellsPrefix(game.spaceId, game.id);
		const array = await tx.scan<GameCell>({ prefix }).entries().toArray();
		return array.map(([_id, value]) => value);
	}, []);

	const clickedOnMine = createMemo(() => {
		return cells.value.some(
			(cell) => cell.clicked && minePositions.has(cell.position),
		);
	});

	const positionsMarked = createMemo(() => {
		return new Set(
			cells.value.filter((cell) => cell.marked).map((cell) => cell.position),
		);
	});

	const uncovered = createMemo(() => {
		return getUncovered({ cells: cells.value, configs });
	});

	return {
		cells,
		configs,
		game,
		minePositions,
		clickedOnMine,
		uncovered,
		positionsMarked,
	};
};

export type GameDataContextData = ReturnType<typeof createGameData>;

const GameDataContext = createContext<() => GameDataContextData>(() => {
	throw new Error("GameDataContext not defined");
});

export const useGameData = () => {
	return useContext(GameDataContext);
};

type GameDataProviderProps = ParentProps<{
	spaceId: string;
}>;

export const GameDataProvider: Component<GameDataProviderProps> = (props) => {
	const game = createSubscription(async (tx) => {
		const prefix = getGamePrefix(props.spaceId);
		const array = await tx
			.scan<SelectGameResult>({ prefix, limit: 1 })
			.entries()
			.toArray();
		return array.pop()?.[1];
	});

	return (
		<Show
			when={game.value}
			fallback={<CreateGameCard spaceId={props.spaceId} />}
		>
			{(game) => {
				const value = createMemo(() => createGameData(game()));
				return (
					<GameDataContext.Provider value={value}>
						{props.children}
					</GameDataContext.Provider>
				);
			}}
		</Show>
	);
};
