import { redirect } from "@solidjs/router";
import { type RequestEvent, getRequestEvent } from "solid-js/web";
import * as v from "valibot";
import { getCookie, type setCookie } from "vinxi/http";

import { paths } from "~/utils/paths";
import type { ActionResult } from "~/utils/validation";

export type CookieSerializeOptions = Parameters<typeof setCookie>[2];

export const getRequestEventOrThrow = () => {
	const event = getRequestEvent();

	if (!event) {
		throw redirect(paths.notFound, { status: 500 });
	}

	return event;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const rpcSuccessResult = <T = any>(data?: T): ActionResult => {
	return { data, success: true };
};

export const rpcErrorResult = <T extends { message: string }>(
	error: T,
): ActionResult => {
	return { error: error.message, success: false };
};

export const getParsedCookie = async <
	TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
	event: RequestEvent,
	name: string,
	schema: TSchema,
) => {
	const cookie = getCookie(event.nativeEvent, name);

	if (!cookie) {
		return null;
	}

	try {
		const parsed = JSON.parse(cookie);
		const output = await v.parseAsync(schema, parsed);
		return output;
	} catch {
		return null;
	}
};
