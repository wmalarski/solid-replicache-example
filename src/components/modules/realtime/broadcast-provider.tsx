import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import {
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	onCleanup,
	useContext,
} from "solid-js";

import { getBroadcastChannelName, getClientSupabase } from "~/utils/supabase";

const createBroadcastState = (spaceId: string) => {
	const supabase = getClientSupabase();
	const channelName = getBroadcastChannelName(spaceId);
	const channel = supabase.channel(channelName);

	channel.subscribe((status) => {
		if (status !== REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
			return;
		}
	});

	onCleanup(() => {
		supabase.removeChannel(channel);
	});

	return channel;
};

type BroadcastContextState = ReturnType<typeof createBroadcastState>;

const BroadcastContext = createContext<() => BroadcastContextState>(() => {
	throw new Error("BroadcastContext not defined");
});

type BroadcastProviderProps = ParentProps<{
	spaceId: string;
}>;

export const BroadcastProvider: Component<BroadcastProviderProps> = (props) => {
	const value = createMemo(() => createBroadcastState(props.spaceId));

	return (
		<BroadcastContext.Provider value={value}>
			{props.children}
		</BroadcastContext.Provider>
	);
};

export const useBroadcastContext = () => {
	return useContext(BroadcastContext);
};
