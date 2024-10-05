import type { Component } from "solid-js";
import { RealtimeProvider } from "~/components/contexts/realtime";
import { ReplicacheProvider } from "~/components/contexts/replicache";
import type { SelectGameResult } from "~/server/replicache/db";
import { HStack, Stack } from "~/styled-system/jsx";
import { BoardGrid } from "./board-grid";
import { RestartGameDialog } from "./restart-game-dialog";

type BoardProps = {
	game: SelectGameResult;
	playerId: string;
	gameId: string;
};

export default function Board(props: BoardProps) {
	return (
		<RealtimeProvider>
			<ReplicacheProvider playerId={props.playerId} gameId={props.gameId}>
				<Stack>
					<BoardTopBar game={props.game} />
					<BoardGrid gameId={props.gameId} game={props.game} />
				</Stack>
			</ReplicacheProvider>
		</RealtimeProvider>
	);
}

type BoardTopBarProps = {
	game: SelectGameResult;
};

const BoardTopBar: Component<BoardTopBarProps> = (props) => {
	return (
		<HStack>
			<MinesLeftCounter />
			<RestartGameDialog initialData={props.game} />
			<SecondsCounter />
		</HStack>
	);
};

const SecondsCounter: Component = () => {
	return <span>SecondsCounter</span>;
};

const MinesLeftCounter: Component = () => {
	return <span>MinesLeftCounter</span>;
};
