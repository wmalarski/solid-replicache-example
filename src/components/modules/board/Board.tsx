import { RealtimeProvider } from "~/components/contexts/realtime";
import { ReplicacheProvider } from "~/components/contexts/replicache";
import { Spinner } from "~/components/ui/spinner";
import { Stack } from "~/styled-system/jsx";
import { FormLayout, PageLayout } from "../common/layout";
import { CreateGameCard } from "../create-game/create-game-card";
import { BoardGrid } from "./board-grid";
import { BoardTopBar } from "./board-top-board";
import { GameDataProvider } from "./game-provider";
import { SuccessConfetti } from "./success-confetti";

type BoardProps = {
	spaceId: string;
	playerId: string;
};

export default function Board(props: BoardProps) {
	return (
		<RealtimeProvider>
			<ReplicacheProvider playerId={props.playerId} spaceId={props.spaceId}>
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
				</GameDataProvider>
			</ReplicacheProvider>
		</RealtimeProvider>
	);
}
