import { throttle } from "@solid-primitives/scheduled";
import {
	REALTIME_LISTEN_TYPES,
	REALTIME_PRESENCE_LISTEN_EVENTS,
} from "@supabase/supabase-js";
import {
	type Component,
	type ParentProps,
	createContext,
	createEffect,
	createMemo,
	useContext,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import { useBroadcastContext } from "./broadcast-provider";
import { usePlayerPresence } from "./presence-provider";

const CURSOR_EVENT_NAME = "space:cursor";
const REALTIME_THROTTLE_TIME = 100;

export type PlayerCursorState = {
	x: number;
	y: number;
};

type PlayerCursorPayload = {
	playerId: string;
} & PlayerCursorState;

type PlayersCursorState = Record<string, PlayerCursorState | undefined>;

const createPlayerCursorState = (playerId: string) => {
	const [cursors, setCursors] = createStore<PlayersCursorState>({});

	const presence = usePlayerPresence();
	const broadcastChannel = useBroadcastContext();

	createEffect(() => {
		broadcastChannel().on<PlayerCursorPayload>(
			REALTIME_LISTEN_TYPES.BROADCAST,
			{ event: CURSOR_EVENT_NAME },
			({ payload }) => {
				setCursors(
					produce((state) => {
						if (payload.playerId === playerId) {
							return;
						}

						const player = state[payload.playerId];
						if (player) {
							player.x = payload.x;
							player.y = payload.y;
							return;
						}
						state[payload.playerId] = {
							x: payload.x,
							y: payload.y,
						};
					}),
				);
			},
		);
	});

	createEffect(() => {
		presence().channel.on(
			REALTIME_LISTEN_TYPES.PRESENCE,
			{ event: REALTIME_PRESENCE_LISTEN_EVENTS.LEAVE },
			({ leftPresences }) => {
				setCursors(
					produce((state) => {
						leftPresences.forEach((presence) => {
							state[presence.id] = undefined;
						});
					}),
				);
			},
		);
	});

	const send = throttle((state: PlayerCursorState) => {
		broadcastChannel().send({
			event: CURSOR_EVENT_NAME,
			type: REALTIME_LISTEN_TYPES.BROADCAST,
			payload: { ...state, playerId },
		});
	}, REALTIME_THROTTLE_TIME);

	return { cursors, send };
};

type PlayerCursorContextState = ReturnType<typeof createPlayerCursorState>;

const PlayerCursorContext = createContext<() => PlayerCursorContextState>(
	() => {
		throw new Error("PlayerCursorContext not defined");
	},
);

type PlayerCursorProviderProps = ParentProps<{
	playerId: string;
}>;

export const PlayerCursorProvider: Component<PlayerCursorProviderProps> = (
	props,
) => {
	const value = createMemo(() => createPlayerCursorState(props.playerId));

	return (
		<PlayerCursorContext.Provider value={value}>
			{props.children}
		</PlayerCursorContext.Provider>
	);
};

export const usePlayerCursors = () => {
	return useContext(PlayerCursorContext);
};
