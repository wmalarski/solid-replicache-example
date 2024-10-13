import { action, cache } from "@solidjs/router";

import { PLAYER_CACHE_KEY } from "./const";
import {
	getPlayerIdServerLoader,
	setPlayerDetailsServerAction,
} from "./server";

export const getPlayerLoader = cache(getPlayerIdServerLoader, PLAYER_CACHE_KEY);
export const setPlayerDetailAction = action(setPlayerDetailsServerAction);
