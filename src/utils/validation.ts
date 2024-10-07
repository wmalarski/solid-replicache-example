import type * as v from "valibot";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type ActionResult<T = any> = {
	data?: T;
	error?: string;
	errors?: Record<string, string>;
	success: boolean;
};

export const parseValibotIssues = (
	issues: v.BaseIssue<unknown>[],
): ActionResult => {
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
