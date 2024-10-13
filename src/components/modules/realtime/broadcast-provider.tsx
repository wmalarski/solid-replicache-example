import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import { type Component, onCleanup } from "solid-js";

import { getClientSupabase, getSpaceChannelName } from "~/utils/supabase";

type BroadcastProviderProps = {
	spaceId: string;
};

export const BroadcastProvider: Component<BroadcastProviderProps> = (props) => {
	const supabase = getClientSupabase();
	const channelName = getSpaceChannelName(props.spaceId);
	const channel = supabase.channel(channelName);

	channel.subscribe((status) => {
		if (status !== REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
			return;
		}
	});

	onCleanup(() => {
		supabase.removeChannel(channel);
	});

	return null;
};
