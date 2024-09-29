import { cache } from "@solidjs/router";

import { PLAYER_CACHE_KEY } from "./const";
import { getPlayerIdServerAction } from "./server";

export const getPlayerLoader = cache(getPlayerIdServerAction, PLAYER_CACHE_KEY);
