import { REALTIME_LISTEN_TYPES } from "@supabase/supabase-js";
import { type Component, createEffect } from "solid-js";
import { useReplicacheContext } from "~/components/contexts/replicache";
import {
	SYNC_PUSH_EVENT_NAME,
	getClientSupabase,
	getSpaceChannelName,
} from "~/utils/supabase";

type SyncPushProviderProps = {
	spaceId: string;
};

export const SyncPushProvider: Component<SyncPushProviderProps> = (props) => {
	createEffect(() => {
		const rep = useReplicacheContext();

		const supabase = getClientSupabase();
		const channelName = getSpaceChannelName(props.spaceId);
		const channel = supabase.channel(channelName);

		channel.on(
			REALTIME_LISTEN_TYPES.BROADCAST,
			{ event: SYNC_PUSH_EVENT_NAME },
			() => rep().pull(),
		);
	});

	return null;
};
