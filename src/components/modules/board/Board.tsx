import { ReplicacheProvider } from "~/components/contexts/replicache";
import type { SelectGameResult } from "~/server/games/db";
import type { Player } from "~/server/player/utils";

type BoardProps = {
	spaceId: string;
	player: Player;
	game?: SelectGameResult;
};

export default function Board(props: BoardProps) {
	return (
		<ReplicacheProvider playerId={props.player.id} spaceId={props.spaceId}>
			{/* <BroadcastProvider spaceId={props.spaceId}>
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
			</BroadcastProvider> */}
			<span>Hello</span>
		</ReplicacheProvider>
	);
}
