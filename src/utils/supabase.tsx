import { createClient } from "@supabase/supabase-js";
import * as v from "valibot";

const BROADCAST_CHANNEL_NAME = "space:broadcast";
export const SYNC_PUSH_EVENT_NAME = "space:sync";

export const getBroadcastChannelName = (spaceId: string) => {
	return `${BROADCAST_CHANNEL_NAME}:${spaceId}`;
};

const createSupabaseClient = () => {
	const schema = v.object({ key: v.string(), url: v.string() });
	const parsed = v.parse(schema, {
		key: import.meta.env.VITE_SUPABASE_ANON_KEY,
		url: import.meta.env.VITE_SUPABASE_URL,
	});

	const client = createClient(parsed.url, parsed.key);

	return client;
};

const supabase = createSupabaseClient();

export const getClientSupabase = () => {
	return supabase;
};
