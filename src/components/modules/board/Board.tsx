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
import { Stack } from "~/styled-system/jsx";

type BoardProps = {
	playerId: string;
	gameId: string;
};

export default function Board(props: BoardProps) {
	return (
		<RealtimeProvider>
			<ReplicacheProvider playerId={props.playerId} gameId={props.gameId}>
				<Messages gameId={props.gameId} />
			</ReplicacheProvider>
		</RealtimeProvider>
	);
}

type MessagesProps = {
	gameId: string;
};

const Messages: Component<MessagesProps> = (props) => {
	const messages = createSubscription(async (tx: ReadTransaction) => {
		const list = await tx
			.scan<GameCell>({ prefix: "message/" })
			.entries()
			.toArray();
		return list.map(([_id, cell]) => cell);
	}, []);

	return (
		<Stack gap="4">
			<BoardCell
				positionX={0}
				positionY={0}
				messages={messages.value}
				gameId={props.gameId}
			/>
			<For each={messages.value}>
				{(value) => <pre>{JSON.stringify(value, null, 2)}</pre>}
			</For>
		</Stack>
	);
};

type BoardCellProps = {
	messages: GameCell[];
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

		if (cell) {
			await rep().mutate.updateCell({
				id: nanoid(),
				clicked: true,
				marked: false,
				positionX: props.positionX,
				positionY: props.positionY,
			});
			return;
		}

		await rep().mutate.insertCell({
			id: nanoid(),
			clicked: true,
			marked: false,
			positionX: props.positionX,
			positionY: props.positionY,
		});
	};

	return (
		<button onClick={onClick} type="button">
			{JSON.stringify(cell.value, null, 2)}
		</button>
	);
};
