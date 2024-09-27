"use server";
import { Message, ReplicacheClient, ReplicacheServer } from "@/schema";
import type { FetchEvent } from "@solidjs/start/server";
import { db } from "./db/db";

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
