import { type Component, createUniqueId } from "solid-js";

import { useSubmission } from "@solidjs/router";
import { useI18n } from "~/components/contexts/i18n";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { insertGameAction } from "~/server/replicache/client";
import { CreateGameForm } from "./create-game-form";

export const CreateGameCard: Component = () => {
	const { t } = useI18n();

	const formId = createUniqueId();
	const submission = useSubmission(insertGameAction);

	return (
		<Card.Root w="full" maxW="sm" p={4}>
			<Card.Header>
				<Card.Title>{t("createBoard.title")}</Card.Title>
			</Card.Header>
			<Card.Body>
				<form id={formId} action={insertGameAction} method="post">
					<CreateGameForm result={submission.result} />
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
