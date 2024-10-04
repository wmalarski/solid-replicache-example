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

type CellInfo = {
	neighbors: number[];
	crossNeighbors: number[];
	count: number;
	lake?: number[];
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

		const cellInfos = new Map<number, CellInfo>();
		const minePositions = new Set<number>();
		const positionsWithZero = new Array<number>();

		cellCodes.forEach((cellCode, index) => {
			if (cellCode === "X") {
				minePositions.add(index);
			}
		});

		cellCodes.forEach((_cellCode, index) => {
			const cellX = index % columns;
			const cellY = Math.floor(index / columns);

			const fromX = Math.max(0, cellX - 1);
			const toX = Math.min(columns - 1, cellX + 1);
			const fromY = Math.max(0, cellY - 1);
			const toY = Math.min(rows - 1, cellY + 1);

			const positions: number[] = [];
			const crossPositions: number[] = [];

			for (let x = fromX; x <= toX; x++) {
				for (let y = fromY; y <= toY; y++) {
					const position = y * columns + x;
					if (position !== index) {
						positions.push(position);
						if (x === cellX || y === cellY) {
							crossPositions.push(position);
						}
					}
				}
			}

			const count = positions.filter((position) =>
				minePositions.has(position),
			).length;

			if (count < 1) {
				positionsWithZero.push(index);
			}

			cellInfos.set(index, {
				neighbors: positions,
				crossNeighbors: crossPositions,
				count,
			});
		});

		positionsWithZero.forEach((position) => {
			if (cellInfos.get(position)?.lake) {
				return;
			}

			const lake = new Array<number>();
			const queue = [position];

			while (queue.length > 0) {
				const index = queue.pop();

				if (index === undefined) {
					continue;
				}

				lake.push(index);

				const info = cellInfos.get(index);

				if (!info) {
					continue;
				}

				cellInfos.set(index, { ...info, lake });
				const zeroNeighbors = info.crossNeighbors.filter(
					(neighbor) =>
						positionsWithZero.includes(neighbor) &&
						!lake.includes(neighbor) &&
						!queue.includes(neighbor),
				);

				queue.push(...zeroNeighbors);
			}

			const all = new Set(
				lake
					.flatMap((index) => cellInfos.get(index)?.neighbors ?? [])
					.filter((index) => !lake.includes(index)),
			);

			lake.push(...all);
		});

		return cellInfos;
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
