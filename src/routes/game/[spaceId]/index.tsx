import { type RouteDefinition, createAsync, useParams } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { BoardWrapper } from "~/components/modules/board/board-wrapper";
import { LoadingPlaceholder } from "~/components/modules/common/loading-placeholder";
import { selectGameLoader } from "~/server/games/client";
import { getPlayerLoader } from "~/server/player/client";

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
		<Suspense fallback={<LoadingPlaceholder />}>
			<Show when={player()}>
				{(player) => (
					<BoardWrapper
						spaceId={params.spaceId}
						player={player()}
						game={game()}
					/>
				)}
			</Show>
		</Suspense>
	);
}
