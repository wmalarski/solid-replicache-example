import type { Component } from "solid-js";
import { Button } from "~/components/ui/button";
import {
	ReplicacheProvider,
	createSubscription,
	useReplicacheContext,
} from "~/contexts/replicache";

type BoardProps = {
	playerId: string;
};

export default function Board(props: BoardProps) {
	return (
		<ReplicacheProvider playerId={props.playerId}>
			<Actions />
		</ReplicacheProvider>
	);
}

const Actions: Component = () => {
	const rep = useReplicacheContext();

	const onClick = () => {
		rep().mutate.increment(1);
	};

	const counter = createSubscription((tx) => tx.get("count") ?? 0);

	return (
		<Button onClick={onClick} type="button">
			Click {JSON.stringify(counter.value)}
		</Button>
	);
};
