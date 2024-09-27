"use server";
import type { FetchEvent } from "@solidjs/start/server";
import { db } from "./db/db";
import { Message, ReplicacheClient, ReplicacheServer } from "./db/schema";

export const getServerContext = (event: FetchEvent) => {
	return {
		event,
		db,
		schema: {
			ReplicacheServer,
			ReplicacheClient,
			Message,
		},
	};
};

export type ServerContext = ReturnType<typeof getServerContext>;
