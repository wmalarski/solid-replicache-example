import { type RouteDefinition, createAsync, useParams } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { Show } from "solid-js";
import { selectGameLoader } from "~/server/games/client";
import { getPlayerLoader } from "~/server/player/client";

const Board = clientOnly(() => import("~/components/modules/board/board"));

export const route = {
	load: async ({ params }) => {
		await Promise.all([getPlayerLoader(), selectGameLoader(params.spaceId)]);
	},
} satisfies RouteDefinition;

export default function GamePage() {
	const params = useParams();

	const player = createAsync(() => getPlayerLoader());
	const game = createAsync(() => selectGameLoader(params.spaceId));

	return (
		<Show when={player()}>
			{(player) => (
				<Board spaceId={params.spaceId} player={player()} game={game()} />
			)}
		</Show>
	);
}
