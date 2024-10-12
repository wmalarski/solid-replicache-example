import { action, cache } from "@solidjs/router";

import { PLAYER_CACHE_KEY } from "./const";
import {
	getPlayerIdServerAction,
	setPlayerDetailsServerAction,
} from "./server";

export const getPlayerLoader = cache(getPlayerIdServerAction, PLAYER_CACHE_KEY);
export const setPlayerDetailAction = action(setPlayerDetailsServerAction);
