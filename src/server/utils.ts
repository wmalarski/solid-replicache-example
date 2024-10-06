import { redirect } from "@solidjs/router";
import { type RequestEvent, getRequestEvent } from "solid-js/web";
import * as v from "valibot";
import { getCookie, type setCookie } from "vinxi/http";

import { paths } from "~/utils/paths";

export type CookieSerializeOptions = Parameters<typeof setCookie>[2];

export const getRequestEventOrThrow = () => {
	const event = getRequestEvent();

	if (!event) {
		throw redirect(paths.notFound, { status: 500 });
	}

	return event;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type RpcResult<T = any> = {
	data?: T;
	error?: string;
	errors?: Record<string, string>;
	success: boolean;
};

export const rpcParseIssueResult = (
	issues: v.BaseIssue<unknown>[],
): RpcResult => {
	return {
		errors: Object.fromEntries(
			issues.map((issue) => [
				issue.path?.map((item) => item.key).join(".") || "global",
				issue.message,
			]),
		),
		success: false,
	};
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const rpcSuccessResult = <T = any>(data?: T): RpcResult => {
	return { data, success: true };
};

export const rpcErrorResult = <T extends { message: string }>(
	error: T,
): RpcResult => {
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
