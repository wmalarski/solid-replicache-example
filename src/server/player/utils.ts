import { parse } from "cookie-es";
import * as v from "valibot";

export const PLAYER_COOKIE_NAME = "_player";

export const playerSchema = () => {
	return v.object({
		id: v.pipe(v.string(), v.uuid()),
		name: v.optional(v.string()),
		color: v.optional(v.pipe(v.string(), v.hexColor())),
	});
};

export type Player = v.InferOutput<ReturnType<typeof playerSchema>>;

export const getPlayerFromHeaders = async (headers: HeadersInit) => {
	try {
		const record = headers as Record<string, string>;
		const cookie = parse(record.cookie)[PLAYER_COOKIE_NAME];
		const parsed = JSON.parse(cookie);
		const output = await v.parseAsync(playerSchema(), parsed);
		return output;
	} catch {
		return null;
	}
};
