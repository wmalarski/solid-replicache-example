import { RealtimeProvider } from "~/components/contexts/realtime";
import { ReplicacheProvider } from "~/components/contexts/replicache";
import { Spinner } from "~/components/ui/spinner";
import type { Player } from "~/server/player/utils";
import { Stack } from "~/styled-system/jsx";
import { FormLayout, PageLayout } from "../common/layout";
import { CreateGameCard } from "../create-game/create-game-card";
import { UpdatePlayerDialog } from "../player/update-player-dialog";
import { BroadcastProvider } from "../realtime/broadcast-provider";
import { PlayerCursorProvider } from "../realtime/cursor-provider";
import { PlayerPresenceProvider } from "../realtime/presence-provider";
import { RemoteCursors } from "../realtime/remote-cursors";
import { BoardGrid } from "./board-grid";
import { BoardTopBar } from "./board-top-board";
import { GameDataProvider } from "./game-provider";
import { SuccessConfetti } from "./success-confetti";

type BoardProps = {
	spaceId: string;
	player: Player;
};

export default function Board(props: BoardProps) {
	return (
		<RealtimeProvider>
			<ReplicacheProvider playerId={props.player.id} spaceId={props.spaceId}>
				<PlayerCursorProvider playerId={props.player.id}>
					<PlayerPresenceProvider spaceId={props.spaceId} player={props.player}>
						<BroadcastProvider spaceId={props.spaceId} />
						<GameDataProvider
							spaceId={props.spaceId}
							loadingPlaceholder={
								<Stack alignItems="center" p={10} width="full">
									<Spinner size="lg" />
								</Stack>
							}
							emptyPlaceholder={
								<FormLayout>
									<CreateGameCard spaceId={props.spaceId} />
								</FormLayout>
							}
						>
							<PageLayout>
								<Stack>
									<BoardTopBar />
									<BoardGrid />
								</Stack>
							</PageLayout>
							<SuccessConfetti />
							<RemoteCursors />
							<UpdatePlayerDialog player={props.player} />
						</GameDataProvider>
					</PlayerPresenceProvider>
				</PlayerCursorProvider>
			</ReplicacheProvider>
		</RealtimeProvider>
	);
}
