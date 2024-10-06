"use server";
import type { FetchEvent } from "@solidjs/start/server";
import { db } from "./db/db";
import { Cell, Game, ReplicacheClient, ReplicacheSpace } from "./db/schema";

export const getServerContext = (event: FetchEvent) => {
	return {
		event,
		db,
		schema: {
			ReplicacheSpace,
			ReplicacheClient,
			Cell,
			Game,
		},
	};
};

export type ServerContext = ReturnType<typeof getServerContext>;
