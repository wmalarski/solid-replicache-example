import { action, cache } from "@solidjs/router";
import { BOARD_CACHE_KEY } from "./const";
import { insertGameServerAction, selectGameServerLoader } from "./server";

export const insertGameAction = action(insertGameServerAction);

export const selectGameLoader = cache(selectGameServerLoader, BOARD_CACHE_KEY);
