import { useSubmission } from "@solidjs/router";
import type { Component } from "solid-js";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { insertGameAction } from "~/server/replicache/client";
import { flex } from "~/styled-system/patterns";

export const CreateGameForm: Component = () => {
	const submission = useSubmission(insertGameAction);

	return (
		<form
			action={insertGameAction}
			class={flex({ gap: "4", alignItems: "flex-end" })}
		>
			<Field.Root>
				<Field.Label>Name</Field.Label>
				<Field.Input name="name" />
			</Field.Root>

			<Field.Root>
				<Field.Label>Width</Field.Label>
				<Field.Input min="5" max="20" type="number" name="width" />
			</Field.Root>

			<Field.Root>
				<Field.Label>Height</Field.Label>
				<Field.Input min="5" max="20" type="number" name="height" />
			</Field.Root>

			<Field.Root>
				<Field.Label>Mines(%)</Field.Label>
				<Field.Input min="10" max="90" type="number" name="mines" />
			</Field.Root>

			<Button type="submit" loading={submission.pending}>
				Submit
			</Button>
		</form>
	);
};
