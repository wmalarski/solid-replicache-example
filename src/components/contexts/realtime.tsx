import {
	type Component,
	type ParentProps,
	createContext,
	createEffect,
	createMemo,
	onCleanup,
	useContext,
} from "solid-js";

const createWebsocket = () => {
	const websocket = new WebSocket("http://localhost:3000/_ws");

	onCleanup(() => {
		websocket.close();
	});

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

	return (
		<RealtimeContext.Provider value={websocket}>
			{props.children}
		</RealtimeContext.Provider>
	);
};

type CreateRealtimeSubscriptionArgs<K extends keyof WebSocketEventMap> = {
	type: K;
	callback: (event: WebSocketEventMap[K]) => void;
};

export const createRealtimeSubscription = <K extends keyof WebSocketEventMap>(
	options: () => CreateRealtimeSubscriptionArgs<K>,
) => {
	const realtime = useRealtimeContext();

	createEffect(() => {
		const args = options();
		const websocket = realtime();

		websocket.addEventListener(args.type, args.callback);

		onCleanup(() => {
			websocket.removeEventListener(args.type, args.callback);
		});
	});
};
