import { REALTIME_LISTEN_TYPES } from "@supabase/supabase-js";
import { type Component, createEffect } from "solid-js";
import { useReplicacheContext } from "~/components/contexts/replicache";
import { SYNC_PUSH_EVENT_NAME } from "~/utils/supabase";
import { useBroadcastContext } from "./broadcast-provider";

export const SyncPushProvider: Component = () => {
	const rep = useReplicacheContext();
	const channel = useBroadcastContext();

	createEffect(() => {
		const broadcastChannel = channel();

		broadcastChannel.on(
			REALTIME_LISTEN_TYPES.BROADCAST,
			{ event: SYNC_PUSH_EVENT_NAME },
			() => rep().pull(),
		);
	});

	return null;
};
