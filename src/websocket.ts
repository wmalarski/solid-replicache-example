import { defineWebSocket, eventHandler } from "vinxi/http";

const server = eventHandler({
	handler: () => {},
	websocket: defineWebSocket({
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
	}),
});

export default server;
