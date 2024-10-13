import {
	REALTIME_LISTEN_TYPES,
	REALTIME_SUBSCRIBE_STATES,
} from "@supabase/supabase-js";
import { type Component, onCleanup } from "solid-js";

import {
	SYNC_PUSH_EVENT_NAME,
	getClientSupabase,
	getSpaceChannelName,
} from "~/utils/supabase";
import { useSyncPushContext } from "./sync-push-provider";

type BroadcastProviderProps = {
	spaceId: string;
};

export const BroadcastProvider: Component<BroadcastProviderProps> = (props) => {
	const pushSync = useSyncPushContext();

	const supabase = getClientSupabase();
	const channelName = getSpaceChannelName(props.spaceId);
	const channel = supabase.channel(channelName);

	channel
		.on(REALTIME_LISTEN_TYPES.BROADCAST, { event: SYNC_PUSH_EVENT_NAME }, () =>
			pushSync().syncData(),
		)
		.subscribe((status) => {
			if (status !== REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
				return;
			}

			pushSync().setRemoteSender(() => {
				channel.send({
					event: SYNC_PUSH_EVENT_NAME,
					type: REALTIME_LISTEN_TYPES.BROADCAST,
					payload: {},
				});
			});
		});

	onCleanup(() => {
		supabase.removeChannel(channel);
	});

	return null;
};
