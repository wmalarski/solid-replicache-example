import { defineWebSocket, eventHandler } from "vinxi/http";

const websocket = defineWebSocket({
	async open(peer) {
		console.log("Open", peer);
	},
	async message(peer, message) {
		console.log("Message", peer, message);

		peer.send("Hi");
	},
	async close(peer, details) {
		console.log("CLOSE", peer, details);
	},
});

const server = eventHandler({
	handler: () => {},
	websocket,
});

export default server;

type WebsocketLocals = {
	publish: Map<string, () => void>;
};

declare module "@solidjs/start/server" {
	interface RequestEventLocals {
		publish: WebsocketLocals;
	}
}
