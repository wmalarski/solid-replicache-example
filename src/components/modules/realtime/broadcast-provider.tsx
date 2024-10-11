import { throttle } from "@solid-primitives/scheduled";
import {
	REALTIME_LISTEN_TYPES,
	REALTIME_SUBSCRIBE_STATES,
} from "@supabase/supabase-js";
import { type Component, onCleanup } from "solid-js";

import { getClientSupabase } from "~/utils/supabase";

import { REALTIME_THROTTLE_TIME } from "./const";
import { type PlayerCursorPayload, usePlayerCursors } from "./cursor-provider";

const CHANNEL_NAME = "rooms:broadcast";
const CURSOR_EVENT_NAME = "rooms:cursor";

type BroadcastProviderProps = {
	boardId: string;
};

export const BroadcastProvider: Component<BroadcastProviderProps> = (props) => {
	const cursors = usePlayerCursors();

	const supabase = getClientSupabase();
	const channelName = `${CHANNEL_NAME}:${props.boardId}`;
	const channel = supabase.channel(channelName);

	channel
		.on<PlayerCursorPayload>(
			REALTIME_LISTEN_TYPES.BROADCAST,
			{ event: CURSOR_EVENT_NAME },
			({ payload }) => cursors().setRemoteCursor(payload),
		)
		.subscribe((status) => {
			if (status !== REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
				return;
			}

			cursors().setRemoteSender(
				throttle((payload) => {
					channel.send({
						event: CURSOR_EVENT_NAME,
						payload,
						type: REALTIME_LISTEN_TYPES.BROADCAST,
					});
				}, REALTIME_THROTTLE_TIME),
			);
		});

	onCleanup(() => {
		supabase.removeChannel(channel);
	});

	return null;
};
