import type { APIEvent } from "@solidjs/start/server";

export const POST = (_event: APIEvent) => {
	return {
		// We will discuss these two fields in later steps.
		lastMutationIDChanges: {},
		cookie: 42,
		patch: [
			{ op: "clear" },
			{
				op: "put",
				key: "message/qpdgkvpb9ao",
				value: {
					from: "Jane",
					content: "Hey, what's for lunch?",
					order: 1,
				},
			},
			{
				op: "put",
				key: "message/5ahljadc408",
				value: {
					from: "Fred",
					content: "tacos?",
					order: 2,
				},
			},
		],
	};
};
