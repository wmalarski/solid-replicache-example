import { ReplicacheProvider } from "~/components/contexts/replicache";
import type { SelectGameResult } from "~/server/games/db";
import type { Player } from "~/server/player/utils";
import { Stack } from "~/styled-system/jsx";
import { FormLayout, PageLayout } from "../common/layout";
import { LoadingPlaceholder } from "../common/loading-placeholder";
import { CreateGameCard } from "../create-game/create-game-card";
import { UpdatePlayerDialog } from "../player/update-player-dialog";
import { BroadcastProvider } from "../realtime/broadcast-provider";
import { PlayerCursorProvider } from "../realtime/cursor-provider";
import { PlayerPresenceProvider } from "../realtime/presence-provider";
import { SyncPushProvider } from "../realtime/sync-push-provider";
import { BoardGrid } from "./board-grid";
import { BoardTopBar } from "./board-top-board";
import { GameDataProvider } from "./game-provider";
import { SuccessConfetti } from "./success-confetti";

type BoardProps = {
	spaceId: string;
	player: Player;
	game?: SelectGameResult;
};

export default function Board(props: BoardProps) {
	return (
		<ReplicacheProvider playerId={props.player.id} spaceId={props.spaceId}>
			<BroadcastProvider spaceId={props.spaceId}>
				<PlayerPresenceProvider spaceId={props.spaceId} player={props.player}>
					<PlayerCursorProvider playerId={props.player.id}>
						<SyncPushProvider />
						<GameDataProvider
							initialGame={props.game}
							spaceId={props.spaceId}
							loadingPlaceholder={<LoadingPlaceholder />}
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
							<UpdatePlayerDialog player={props.player} />
						</GameDataProvider>
					</PlayerCursorProvider>
				</PlayerPresenceProvider>
			</BroadcastProvider>
		</ReplicacheProvider>
	);
}
