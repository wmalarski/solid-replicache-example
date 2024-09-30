import { defineWebSocket, eventHandler } from "vinxi/http";
import { broadcastChannel } from "./server/realtime/channel";

export default eventHandler({
	handler: () => {},
	websocket: defineWebSocket({
		async open(peer) {
			const listener = (event: MessageEvent) => {
				peer.send(event.data);
			};

			broadcastChannel.addEventListener("message", listener);
			peer.ctx.listener = listener;
		},
		async close(peer) {
			broadcastChannel.removeEventListener("message", peer.ctx.listener);
		},
	}),
});
