import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, createEffect } from "solid-js";
import "./app.css";

export default function App() {
	createEffect(() => {
		console.log("Websocket");
		const ws = new WebSocket("http://localhost:3000/_ws");

		ws.onopen = (event) => {
			console.log("OPEN", event);
			ws.send("Hello");
		};

		ws.onmessage = (event) => {
			console.log("MESSAGE", event);
		};
	});

	return (
		<Router
			root={(props) => (
				<MetaProvider>
					<Title>SolidStart - Basic</Title>
					<a href="/">Index</a>
					<a href="/about">About</a>
					<Suspense>{props.children}</Suspense>
				</MetaProvider>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
