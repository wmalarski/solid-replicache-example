import { type Component, For, createMemo } from "solid-js";
import { RealtimeProvider } from "~/components/contexts/realtime";
import {
	ReplicacheProvider,
	createSubscription,
} from "~/components/contexts/replicache";
import type { GameCell } from "~/server/cells/types";
import { getGameKey } from "~/server/replicache/utils";
import { Grid, Stack } from "~/styled-system/jsx";
import { BoardCell } from "./board-cell";
import { getCellInfos } from "./utils";

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
	const game = createSubscription(async (tx) => {
		return tx
			.scan<GameCell>({ prefix: getGameKey(props.gameId) })
			.entries()
			.toArray();
	}, []);

	const neighbors = createMemo(() => {
		const columns = props.width;
		const rows = Math.floor(props.code.length / props.width);
		const cellCodes = props.code.split("");

		return getCellInfos({ cellCodes, columns, rows });
	});

	const cellsMap = createMemo(() => {
		const cellsMap = new Map<number, GameCell>();

		game.value.forEach(([_id, gameCell]) =>
			cellsMap.set(gameCell.position, gameCell),
		);

		return cellsMap;
	});

	return (
		<Stack>
			<Grid
				style={{ "grid-template-columns": `repeat(${props.width}, 1fr)` }}
				width="fit-content"
				gap={0}
			>
				<For each={[...props.code]}>
					{(cellCode, index) => (
						<BoardCell
							position={index()}
							gameId={props.gameId}
							cellCode={cellCode}
							cell={cellsMap().get(index())}
						/>
					)}
				</For>
			</Grid>
			<pre>
				{JSON.stringify(Object.fromEntries(neighbors().entries()), null, 2)}
			</pre>
			<pre>{JSON.stringify(game.value, null, 2)}</pre>
		</Stack>
	);
};
