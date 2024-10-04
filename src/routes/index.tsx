import { ThemeToggle } from "~/components/modules/common/theme-toggle";
import { CreateGameForm } from "~/components/modules/create-game/create-game-form";

export default function Home() {
	return (
		<main>
			<ThemeToggle />
			<CreateGameForm />
		</main>
	);
}
