"use server";
import type { CookieSerializeOptions } from "cookie-es";
import { setCookie } from "vinxi/http";
import { getParsedCookie, getRequestEventOrThrow } from "../utils";
import { PLAYER_COOKIE_NAME, type Player, playerSchema } from "./utils";

const PLAYER_COOKIE_OPTIONS: CookieSerializeOptions = {
	httpOnly: true,
	maxAge: 1000000,
	sameSite: "lax",
};

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
