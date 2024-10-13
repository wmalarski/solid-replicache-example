import { throttle } from "@solid-primitives/scheduled";
import { REALTIME_LISTEN_TYPES } from "@supabase/supabase-js";
import {
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	useContext,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import {
	CURSOR_EVENT_NAME,
	getClientSupabase,
	getSpaceChannelName,
} from "~/utils/supabase";

const REALTIME_THROTTLE_TIME = 100;

export type PlayerCursorState = {
	x: number;
	y: number;
};

export type PlayerCursorPayload = {
	playerId: string;
} & PlayerCursorState;

type PlayersCursorState = Record<string, PlayerCursorState | undefined>;

const createPlayerCursorState = (spaceId: string, playerId: string) => {
	const supabase = getClientSupabase();
	const channelName = getSpaceChannelName(spaceId);
	const channel = supabase.channel(channelName);

	const setRemoteCursor = (payload: PlayerCursorPayload) => {
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
	};

	channel.on<PlayerCursorPayload>(
		REALTIME_LISTEN_TYPES.BROADCAST,
		{ event: CURSOR_EVENT_NAME },
		({ payload }) => setRemoteCursor(payload),
	);

	const [cursors, setCursors] = createStore<PlayersCursorState>({});

	const send = throttle((state: PlayerCursorState) => {
		channel.send({
			event: CURSOR_EVENT_NAME,
			type: REALTIME_LISTEN_TYPES.BROADCAST,
			payload: { ...state, playerId },
		});
	}, REALTIME_THROTTLE_TIME);

	const leave = (playerIds: string[]) => {
		setCursors(
			produce((state) => {
				playerIds.forEach((playerId) => {
					state[playerId] = undefined;
				});
			}),
		);
	};

	return { cursors, leave, send };
};

type PlayerCursorContextState = ReturnType<typeof createPlayerCursorState>;

const PlayerCursorContext = createContext<() => PlayerCursorContextState>(
	() => {
		throw new Error("PlayerCursorContext not defined");
	},
);

type PlayerCursorProviderProps = ParentProps<{
	spaceId: string;
	playerId: string;
}>;

export const PlayerCursorProvider: Component<PlayerCursorProviderProps> = (
	props,
) => {
	const value = createMemo(() =>
		createPlayerCursorState(props.spaceId, props.playerId),
	);

	return (
		<PlayerCursorContext.Provider value={value}>
			{props.children}
		</PlayerCursorContext.Provider>
	);
};

export const usePlayerCursors = () => {
	return useContext(PlayerCursorContext);
};
