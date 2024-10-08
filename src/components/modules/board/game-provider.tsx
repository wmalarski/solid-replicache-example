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
import { getCellInfos } from "./utils";

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

	return { cells, configs, game, minePositions };
};

const GameDataContext = createContext<() => ReturnType<typeof createGameData>>(
	() => {
		throw new Error("GameDataContext not defined");
	},
);

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
