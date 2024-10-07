import { type Component, createMemo } from "solid-js";
import { RealtimeProvider } from "~/components/contexts/realtime";
import { ReplicacheProvider } from "~/components/contexts/replicache";
import { HStack, Stack } from "~/styled-system/jsx";
import { BoardGrid } from "./board-grid";
import { GameDataProvider, useGameData } from "./game-provider";
import { RestartGameDialog } from "./restart-game-dialog";

type BoardProps = {
	spaceId: string;
	playerId: string;
};

export default function Board(props: BoardProps) {
	return (
		<RealtimeProvider>
			<ReplicacheProvider playerId={props.playerId} spaceId={props.spaceId}>
				<GameDataProvider spaceId={props.spaceId}>
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
	const data = useGameData();

	const minesMarked = createMemo(() => {
		const { cells, minePositions } = data();
		const marked = cells.value.filter((cell) => cell.marked).length;
		return minePositions.size - marked;
	});

	return <span>{minesMarked()}</span>;
};
