import { type RouteDefinition, createAsync, useParams } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { Show } from "solid-js";
import { getPlayerLoader } from "~/server/player/client";

const Board = clientOnly(() => import("~/components/modules/board/board"));

export const route = {
	load: async () => {
		await getPlayerLoader();
	},
} satisfies RouteDefinition;

export default function GamePage() {
	const params = useParams();

	const player = createAsync(() => getPlayerLoader());

	return (
		<main>
			<Show when={player()}>
				{(player) => (
					<Board serverId={params.serverId} playerId={player().id} />
				)}
			</Show>
		</main>
	);
}
