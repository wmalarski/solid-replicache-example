import { throttle } from "@solid-primitives/scheduled";
import {
	REALTIME_LISTEN_TYPES,
	REALTIME_SUBSCRIBE_STATES,
} from "@supabase/supabase-js";
import { type Component, onCleanup } from "solid-js";

import {
	CURSOR_EVENT_NAME,
	SYNC_PUSH_EVENT_NAME,
	getClientSupabase,
	getSpaceChannelName,
} from "~/utils/supabase";

import { type PlayerCursorPayload, usePlayerCursors } from "./cursor-provider";
import { useSyncPushContext } from "./sync-push-provider";

const REALTIME_THROTTLE_TIME = 100;

type BroadcastProviderProps = {
	spaceId: string;
};

export const BroadcastProvider: Component<BroadcastProviderProps> = (props) => {
	const cursors = usePlayerCursors();
	const pushSync = useSyncPushContext();

	const supabase = getClientSupabase();
	const channelName = getSpaceChannelName(props.spaceId);
	const channel = supabase.channel(channelName);

	channel
		.on<PlayerCursorPayload>(
			REALTIME_LISTEN_TYPES.BROADCAST,
			{ event: CURSOR_EVENT_NAME },
			({ payload }) => cursors().setRemoteCursor(payload),
		)
		.on(REALTIME_LISTEN_TYPES.BROADCAST, { event: SYNC_PUSH_EVENT_NAME }, () =>
			pushSync().syncData(),
		)
		.subscribe((status) => {
			if (status !== REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
				return;
			}

			cursors().setRemoteSender(
				throttle((payload) => {
					channel.send({
						event: CURSOR_EVENT_NAME,
						type: REALTIME_LISTEN_TYPES.BROADCAST,
						payload,
					});
				}, REALTIME_THROTTLE_TIME),
			);

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
