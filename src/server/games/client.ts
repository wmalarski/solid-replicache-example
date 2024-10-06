import { action, cache } from "@solidjs/router";
import { GAME_CACHE_KEY } from "./const";
import { insertGameServerAction, selectGameServerLoader } from "./server";

export const insertGameAction = action(insertGameServerAction);
export const selectGameLoader = cache(selectGameServerLoader, GAME_CACHE_KEY);
