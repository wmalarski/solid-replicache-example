import { defineWebSocket, eventHandler } from "vinxi/http";
import { getPlayerFromHeaders } from "./server/player/utils";

const websocket = defineWebSocket({
	async open(peer) {
		const player = await getPlayerFromHeaders(peer.headers);

		console.log("OPEN", player);

		if (!player) {
			return;
		}

		console.log("Open", player.id);
	},
	async message(peer, message) {
		const player = await getPlayerFromHeaders(peer.headers);

		console.log("Message", message, player);

		peer.send(`Hi ${player?.id}`);
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
