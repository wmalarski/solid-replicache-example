import { type Component, For } from "solid-js";
import { RealtimeProvider } from "~/components/contexts/realtime";
import { ReplicacheProvider } from "~/components/contexts/replicache";
import { Grid } from "~/styled-system/jsx";
import { BoardCell } from "./board-cell";

type BoardProps = {
	playerId: string;
	gameId: string;
	width: number;
	code: string;
};

export default function Board(props: BoardProps) {
	return (
		<RealtimeProvider>
			<ReplicacheProvider playerId={props.playerId} gameId={props.gameId}>
				<BoardCells
					gameId={props.gameId}
					code={props.code}
					width={props.width}
				/>
			</ReplicacheProvider>
		</RealtimeProvider>
	);
}

type BoardCellsProps = {
	gameId: string;
	width: number;
	code: string;
};

const BoardCells: Component<BoardCellsProps> = (props) => {
	return (
		<Grid
			style={{ "grid-template-columns": `repeat(${props.width}, 1fr)` }}
			width="fit-content"
			gap={0}
		>
			<For each={[...props.code]}>
				{(cellCode, index) => (
					<BoardCell
						positionX={index() % props.width}
						positionY={Math.floor(index() / props.width)}
						cellCode={cellCode}
						gameId={props.gameId}
					/>
				)}
			</For>
		</Grid>
	);
};
