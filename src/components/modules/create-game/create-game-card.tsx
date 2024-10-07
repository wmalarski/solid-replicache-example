import {
	type Component,
	type ComponentProps,
	createSignal,
	createUniqueId,
} from "solid-js";

import { useAction, useSubmission } from "@solidjs/router";
import { useI18n } from "~/components/contexts/i18n";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { parseBoardConfig } from "~/server/games/utils";
import { insertSpaceAction } from "~/server/replicache/client";
import { type ActionResult, parseValibotIssues } from "~/utils/validation";
import { CreateGameForm } from "./create-game-form";

export const CreateGameCard: Component = () => {
	const { t } = useI18n();

	const formId = createUniqueId();
	const submission = useSubmission(insertSpaceAction);
	const action = useAction(insertSpaceAction);

	const [result, setResult] = createSignal<ActionResult>();

	const onSubmit: ComponentProps<"form">["onSubmit"] = async (event) => {
		event.preventDefault();
		setResult();

		const formData = new FormData(event.currentTarget);
		const parsed = await parseBoardConfig(formData);

		if (!parsed.success) {
			setResult(parseValibotIssues(parsed.issues));
			return;
		}

		await action();
	};

	return (
		<Card.Root w="full" maxW="sm" p={4}>
			<Card.Header>
				<Card.Title>{t("createBoard.title")}</Card.Title>
			</Card.Header>
			<Card.Body>
				<form id={formId} onSubmit={onSubmit} method="post">
					<CreateGameForm result={result()} />
				</form>
			</Card.Body>
			<Card.Footer>
				<Button type="submit" form={formId} loading={submission.pending}>
					{t("createBoard.button")}
				</Button>
			</Card.Footer>
		</Card.Root>
	);
};
