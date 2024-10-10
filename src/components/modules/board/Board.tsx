import { RealtimeProvider } from "~/components/contexts/realtime";
import { ReplicacheProvider } from "~/components/contexts/replicache";
import { Stack } from "~/styled-system/jsx";
import { PageLayout } from "../common/layout";
import { BoardGrid } from "./board-grid";
import { BoardTopBar } from "./board-top-board";
import { GameDataProvider } from "./game-provider";

type BoardProps = {
	spaceId: string;
	playerId: string;
};

export default function Board(props: BoardProps) {
	return (
		<RealtimeProvider>
			<ReplicacheProvider playerId={props.playerId} spaceId={props.spaceId}>
				<GameDataProvider spaceId={props.spaceId}>
					<PageLayout>
						<Stack>
							<BoardTopBar />
							<BoardGrid />
						</Stack>
					</PageLayout>
				</GameDataProvider>
			</ReplicacheProvider>
		</RealtimeProvider>
	);
}
