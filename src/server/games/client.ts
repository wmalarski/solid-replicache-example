import { cache } from "@solidjs/router";
import { GAME_CACHE_KEY } from "./const";
import { selectGameServerLoader } from "./server";

export const selectGameLoader = cache(selectGameServerLoader, GAME_CACHE_KEY);
