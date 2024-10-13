"use server";
import { reload } from "@solidjs/router";
import type { CookieSerializeOptions } from "cookie-es";
import { decode } from "decode-formdata";
import type { RequestEvent } from "solid-js/web";
import { safeParseAsync } from "valibot";
import { setCookie } from "vinxi/http";
import { parseValibotIssues } from "~/utils/validation";
import { getParsedCookie, getRequestEventOrThrow } from "../utils";
import { PLAYER_CACHE_KEY } from "./const";
import { PLAYER_COOKIE_NAME, type Player, playerSchema } from "./utils";

const PLAYER_COOKIE_OPTIONS: CookieSerializeOptions = {
	httpOnly: true,
	maxAge: 1000000,
	sameSite: "lax",
};

export const getPlayerIdServerLoader = async (): Promise<Player> => {
	const event = getRequestEventOrThrow();

	const player =
		event.locals.updatedPlayer ??
		(await getParsedCookie(event, PLAYER_COOKIE_NAME, playerSchema()));

	if (player) {
		return player;
	}

	const id = crypto.randomUUID();
	const newPlayer: Player = { id };

	setPlayerCookie(event, newPlayer);

	return newPlayer;
};

const setPlayerCookie = (event: RequestEvent, player: Player) => {
	setCookie(
		event.nativeEvent,
		PLAYER_COOKIE_NAME,
		JSON.stringify(player),
		PLAYER_COOKIE_OPTIONS,
	);
};

export const setPlayerDetailsServerAction = async (formData: FormData) => {
	const event = getRequestEventOrThrow();

	const player = await getParsedCookie(
		event,
		PLAYER_COOKIE_NAME,
		playerSchema(),
	);

	if (!player) {
		throw new Error("Player not defined");
	}

	const result = await safeParseAsync(playerSchema(), decode(formData));

	if (result.issues) {
		return parseValibotIssues(result.issues);
	}

	const updatedPlayer: Player = {
		...player,
		...result.output,
	};

	event.locals.updatedPlayer = updatedPlayer;
	setPlayerCookie(event, updatedPlayer);

	throw reload({ revalidate: PLAYER_CACHE_KEY });
};

declare module "@solidjs/start/server" {
	interface RequestEventLocals {
		updatedPlayer?: Player;
	}
}
