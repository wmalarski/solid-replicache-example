import {
	FormLayout,
	PageFooter,
	PageTitle,
} from "~/components/modules/common/layout";
import { CreateGameCard } from "~/components/modules/create-game/create-game-card";

export default function Home() {
	return (
		<FormLayout>
			<PageTitle />
			<CreateGameCard />
			<PageFooter />
		</FormLayout>
	);
}
