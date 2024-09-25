import { type RouteDefinition, createAsync } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { Show } from "solid-js";
import { getPlayerLoader } from "~/server/player/client";

const Board = clientOnly(() => import("~/components/modules/board/Board"));

export const route = {
	load: async () => {
		await getPlayerLoader();
	},
} satisfies RouteDefinition;

export default function Home() {
	const player = createAsync(() => getPlayerLoader());

	return (
		<main>
			<Show when={player()}>
				{(player) => <Board playerId={player().id} />}
			</Show>
		</main>
	);
}
