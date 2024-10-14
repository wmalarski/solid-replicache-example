import { type RouteDefinition, createAsync, useParams } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { Show, Suspense, createSignal, onMount } from "solid-js";
import { LoadingPlaceholder } from "~/components/modules/common/loading-placeholder";
import { selectGameLoader } from "~/server/games/client";
import { getPlayerLoader } from "~/server/player/client";

const Board = clientOnly(() => import("~/components/modules/board/game-board"));

export const route = {
	load: async ({ params }) => {
		await Promise.all([getPlayerLoader(), selectGameLoader(params.spaceId)]);
	},
} satisfies RouteDefinition;

export default function GamePage() {
	const params = useParams();

	const [isMounted, setIsMounted] = createSignal(false);

	onMount(() => {
		setIsMounted(true);
	});

	const player = createAsync(() => getPlayerLoader());
	const game = createAsync(() => selectGameLoader(params.spaceId));

	return (
		<Suspense fallback={<LoadingPlaceholder />}>
			<Show when={player()}>
				{(player) => (
					<Show when={isMounted()} fallback={<LoadingPlaceholder />}>
						<Board spaceId={params.spaceId} player={player()} game={game()} />
					</Show>
				)}
			</Show>
		</Suspense>
	);
}
