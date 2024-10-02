import { nanoid } from "nanoid";
import type { ReadTransaction } from "replicache";
import { type Component, type ComponentProps, For } from "solid-js";
import { RealtimeProvider } from "~/components/contexts/realtime";
import {
	ReplicacheProvider,
	createSubscription,
	getGameCellKey,
	useReplicacheContext,
} from "~/components/contexts/replicache";
import type { GameCell } from "~/server/cells/types";
import { Grid } from "~/styled-system/jsx";

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
		<Grid columnCount={props.width}>
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

type BoardCellProps = {
	cellCode: string;
	gameId: string;
	positionX: number;
	positionY: number;
};

const BoardCell: Component<BoardCellProps> = (props) => {
	const rep = useReplicacheContext();

	const cell = createSubscription(async (tx: ReadTransaction) => {
		return tx.get<GameCell>(
			getGameCellKey({
				gameId: props.gameId,
				positionX: props.positionX,
				positionY: props.positionY,
			}),
		);
	});

	const onClick: ComponentProps<"button">["onClick"] = async (event) => {
		event.preventDefault();

		const common = {
			clicked: true,
			marked: false,
			positionX: props.positionX,
			positionY: props.positionY,
		};

		if (cell.value) {
			await rep().mutate.updateCell({
				id: cell.value.id,
				...common,
			});
			return;
		}

		await rep().mutate.insertCell({
			id: nanoid(),
			gameId: props.gameId,
			...common,
		});
	};

	return (
		<button onClick={onClick} type="button">
			{JSON.stringify({ cell: cell.value, cellCode: props.cellCode }, null, 2)}
		</button>
	);
};
