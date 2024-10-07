import { type Component, createUniqueId } from "solid-js";

import { useSubmission } from "@solidjs/router";
import { useI18n } from "~/components/contexts/i18n";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { insertSpaceAction } from "~/server/replicache/client";

export const CreateSpaceCard: Component = () => {
	const { t } = useI18n();

	const formId = createUniqueId();
	const submission = useSubmission(insertSpaceAction);

	return (
		<Card.Root w="full" maxW="sm" p={4}>
			<Card.Header>
				<Card.Title>{t("createBoard.title")}</Card.Title>
			</Card.Header>
			<Card.Footer>
				<form id={formId} action={insertSpaceAction} method="post">
					<Button type="submit" form={formId} loading={submission.pending}>
						{t("createBoard.button")}
					</Button>
				</form>
			</Card.Footer>
		</Card.Root>
	);
};
