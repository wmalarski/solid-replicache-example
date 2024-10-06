import { type Component, createMemo } from "solid-js";
import { RealtimeProvider } from "~/components/contexts/realtime";
import { ReplicacheProvider } from "~/components/contexts/replicache";
import type { SelectGameResult } from "~/server/games/db";
import { HStack, Stack } from "~/styled-system/jsx";
import { BoardGrid } from "./board-grid";
import { GameDataProvider, useGameData } from "./game-provider";
import { RestartGameDialog } from "./restart-game-dialog";

type BoardProps = {
	game: SelectGameResult;
	playerId: string;
};

export default function Board(props: BoardProps) {
	return (
		<RealtimeProvider>
			<ReplicacheProvider
				playerId={props.playerId}
				spaceId={props.game.spaceId}
			>
				<GameDataProvider game={props.game}>
					<Stack>
						<BoardTopBar />
						<BoardGrid />
					</Stack>
				</GameDataProvider>
			</ReplicacheProvider>
		</RealtimeProvider>
	);
}

const BoardTopBar: Component = () => {
	return (
		<HStack>
			<MinesLeftCounter />
			<RestartGameDialog />
			<SecondsCounter />
		</HStack>
	);
};

const SecondsCounter: Component = () => {
	return <span>SecondsCounter</span>;
};

const MinesLeftCounter: Component = () => {
	const game = useGameData();

	const minesMarked = createMemo(() => {
		const { cells, minePositions } = game();
		const marked = cells.value.filter((cell) => cell.marked).length;
		return minePositions.size - marked;
	});

	return <span>{minesMarked()}</span>;
};
