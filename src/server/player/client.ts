import { cache } from "@solidjs/router";

import { PLAYER_CACHE_KEY } from "./const";
import { getPlayerIdServerAction } from "./rpc";

export const getPlayerLoader = cache(getPlayerIdServerAction, PLAYER_CACHE_KEY);
