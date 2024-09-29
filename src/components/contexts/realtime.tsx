import {
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	onCleanup,
	useContext,
} from "solid-js";

const createWebsocket = () => {
	const websocket = new WebSocket("http://localhost:3000/_ws");

	websocket.onopen = (event) => {
		console.log("OPEN", event);
		websocket.send("Hello");
	};

	websocket.onmessage = (event) => {
		console.log("MESSAGE", event);
	};

	return websocket;
};

const RealtimeContext = createContext<() => ReturnType<typeof createWebsocket>>(
	() => {
		throw new Error("RealtimeContext not defined");
	},
);

export const useRealtimeContext = () => {
	return useContext(RealtimeContext);
};

type RealtimeProviderProps = ParentProps;

export const RealtimeProvider: Component<RealtimeProviderProps> = (props) => {
	const websocket = createMemo(() => {
		return createWebsocket();
	});

	onCleanup(() => {
		websocket().close();
	});

	return (
		<RealtimeContext.Provider value={websocket}>
			{props.children}
		</RealtimeContext.Provider>
	);
};
