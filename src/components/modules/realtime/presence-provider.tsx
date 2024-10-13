import {
	REALTIME_LISTEN_TYPES,
	REALTIME_PRESENCE_LISTEN_EVENTS,
	REALTIME_SUBSCRIBE_STATES,
} from "@supabase/supabase-js";
import {
	type Component,
	type ParentProps,
	createContext,
	createEffect,
	createMemo,
	onCleanup,
	untrack,
	useContext,
} from "solid-js";
import { createStore, produce } from "solid-js/store";

import { randomHexColor } from "~/utils/colors";
import { getClientSupabase } from "~/utils/supabase";

import type { Player } from "~/server/player/utils";
import { usePlayerCursors } from "./cursor-provider";

type PlayersState = Record<string, Player | undefined>;

const PRESENCE_CHANNEL_NAME = "rooms";
const COLOR = randomHexColor();

const createPlayerPresenceState = (player: Player, spaceId: string) => {
	const [players, setPlayers] = createStore<PlayersState>({});
	const cursors = usePlayerCursors();

	const presenceChannel = createMemo(() => {
		const supabase = getClientSupabase();
		const channelName = `${PRESENCE_CHANNEL_NAME}:${spaceId}`;

		return supabase.channel(channelName, {
			config: { presence: { key: spaceId } },
		});
	});

	const subscriptionPayload = createMemo(() => {
		return { color: COLOR, name: player.name, id: player.id };
	});

	createEffect(() => {
		const untrackedPayload = untrack(() => subscriptionPayload());
		const channel = presenceChannel();

		const subscription = channel
			.on(
				REALTIME_LISTEN_TYPES.PRESENCE,
				{ event: REALTIME_PRESENCE_LISTEN_EVENTS.SYNC },
				() => {
					const newState = channel.presenceState<Player>();

					setPlayers(
						produce((state) => {
							newState[spaceId]?.forEach((presence) => {
								state[presence.id] = {
									color: presence.color,
									name: presence.name,
									id: presence.id,
								};
							});
						}),
					);
				},
			)
			.on(
				REALTIME_LISTEN_TYPES.PRESENCE,
				{ event: REALTIME_PRESENCE_LISTEN_EVENTS.JOIN },
				({ newPresences }) => {
					setPlayers(
						produce((state) => {
							newPresences.forEach((presence) => {
								state[presence.id] = {
									color: presence.color,
									name: presence.name,
									id: presence.id,
								};
							});
						}),
					);
				},
			)
			.on(
				REALTIME_LISTEN_TYPES.PRESENCE,
				{ event: REALTIME_PRESENCE_LISTEN_EVENTS.LEAVE },
				({ leftPresences }) => {
					const leftIds = leftPresences.map((presence) => presence.id);

					cursors().leave(leftIds);

					setPlayers(
						produce((state) => {
							leftIds.forEach((playerId) => {
								state[playerId] = undefined;
							});
						}),
					);
				},
			)
			.subscribe(async (status) => {
				if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
					await channel.track(untrackedPayload);
				}
			});

		onCleanup(() => {
			const untrackPresence = async () => {
				await subscription.unsubscribe();
				await channel.untrack();
			};

			untrackPresence();
		});
	});

	createEffect(() => {
		presenceChannel().updateJoinPayload(subscriptionPayload());
	});

	return players;
};

type PlayerPresenceState = ReturnType<typeof createPlayerPresenceState>;

const PlayerPresenceContext = createContext<() => PlayerPresenceState>(() => {
	throw new Error("PlayerPresenceContext not defined");
});

type PlayerPresenceProviderProps = ParentProps<{
	player: Player;
	spaceId: string;
}>;

export const PlayerPresenceProvider: Component<PlayerPresenceProviderProps> = (
	props,
) => {
	const value = createMemo(() =>
		createPlayerPresenceState(props.player, props.spaceId),
	);

	return (
		<PlayerPresenceContext.Provider value={value}>
			{props.children}
		</PlayerPresenceContext.Provider>
	);
};

export const usePlayerPresence = () => {
	return useContext(PlayerPresenceContext);
};
