import {
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	useContext,
} from "solid-js";
import { createSubscription } from "~/components/contexts/replicache";
import type { GameCell } from "~/server/cells/types";
import type { SelectGameResult } from "~/server/replicache/db";
import { getGameKey } from "~/server/replicache/utils";
import { type CellInfo, getCellInfos } from "./utils";

type CreateGameDataArgs = {
	gameId: string;
	game: SelectGameResult;
};

export type GameCellData = {
	config: CellInfo;
	value: GameCell;
};

const createGameData = ({ game, gameId }: CreateGameDataArgs) => {
	const { configs, minePositions } = getCellInfos({
		cellCodes: game.code.split(""),
		columns: game.width,
		rows: Math.floor(game.code.length / game.width),
	});

	const cells = createSubscription(async (tx) => {
		const array = await tx
			.scan<GameCell>({ prefix: getGameKey(gameId) })
			.entries()
			.toArray();

		return array.map(([_id, value]) => value);
	}, []);

	return { cells, configs, game, gameId, minePositions };
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
	gameId: string;
	game: SelectGameResult;
}>;

export const GameDataProvider: Component<GameDataProviderProps> = (props) => {
	const value = createMemo(() => {
		return createGameData({
			game: props.game,
			gameId: props.gameId,
		});
	});

	return (
		<GameDataContext.Provider value={value}>
			{props.children}
		</GameDataContext.Provider>
	);
};
