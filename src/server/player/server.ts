"use server";
import * as v from "valibot";
import { setCookie } from "vinxi/http";

import {
	type CookieSerializeOptions,
	getParsedCookie,
	getRequestEventOrThrow,
} from "../utils";

const PLAYER_COOKIE_NAME = "_player";
const PLAYER_COOKIE_OPTIONS: CookieSerializeOptions = {
	httpOnly: true,
	maxAge: 1000000,
	sameSite: "lax",
};

const playerSchema = () => {
	return v.object({ id: v.pipe(v.string(), v.uuid()) });
};

export type Player = v.InferOutput<ReturnType<typeof playerSchema>>;

export const getPlayerIdServerAction = async (): Promise<Player> => {
	const event = getRequestEventOrThrow();

	const player = await getParsedCookie(
		event,
		PLAYER_COOKIE_NAME,
		playerSchema(),
	);

	if (player) {
		return player;
	}

	const id = crypto.randomUUID();

	setCookie(
		event.nativeEvent,
		PLAYER_COOKIE_NAME,
		JSON.stringify({ id }),
		PLAYER_COOKIE_OPTIONS,
	);

	return { id };
};
