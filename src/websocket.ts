import { defineWebSocket, eventHandler } from "vinxi/http";
import { broadcastChannel } from "./server/realtime/channel";

const websocket = defineWebSocket({
	async open(peer) {
		const listener = (event: MessageEvent) => {
			console.log("Broadcast", event);
			peer.send(event.data);
		};

		broadcastChannel.addEventListener("message", listener);
		peer.ctx.listener = listener;
	},
	// async message(peer, message) {
	// 	const player = await getPlayerFromHeaders(peer.headers);

	// 	console.log("Message", message, player);

	// 	peer.send(`Hi ${player?.id}`);
	// },
	async close(peer, _details) {
		broadcastChannel.removeEventListener("message", peer.ctx.listener);
		console.log("CLOSE", peer);
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
