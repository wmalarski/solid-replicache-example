import { type Component, onCleanup } from "solid-js";
import { Button } from "~/components/ui/button";
import {
	ReplicacheProvider,
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

	const unsubscribe = rep().subscribe((body) => body.get("count"), {
		onData(result) {
			console.log("onData", result);
		},
		onDone() {
			console.log("onDone");
		},
		onError(error) {
			console.log("onError", error);
		},
	});

	onCleanup(() => {
		unsubscribe();
	});

	return (
		<Button onClick={onClick} type="button">
			Click
		</Button>
	);
};
