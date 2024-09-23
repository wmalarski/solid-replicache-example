import { Title } from "@solidjs/meta";
import { type RouteDefinition, createAsync } from "@solidjs/router";
import { getPlayerLoader } from "~/server/player/client";

export const route = {
	load: async () => {
		await getPlayerLoader();
	},
} satisfies RouteDefinition;

export default function Home() {
	const player = createAsync(() => getPlayerLoader());

	return (
		<main>
			<Title>Hello World</Title>
			<h1>Hello world!</h1>
			<pre>{JSON.stringify(player(), null, 2)}</pre>
		</main>
	);
}
