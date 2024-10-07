import {
	type Component,
	type ComponentProps,
	createSignal,
	createUniqueId,
} from "solid-js";

import { useI18n } from "~/components/contexts/i18n";
import { useReplicacheContext } from "~/components/contexts/replicache";
import {
	generateServerGameCode,
	parseBoardConfig,
} from "~/components/modules/create-game/utils";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { type ActionResult, parseValibotIssues } from "~/utils/validation";
import { CreateGameForm } from "./create-game-form";

type CreateGameCardProps = {
	spaceId: string;
};

export const CreateGameCard: Component<CreateGameCardProps> = (props) => {
	const { t } = useI18n();

	const rep = useReplicacheContext();

	const formId = createUniqueId();

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

		await rep().mutate.insertGame({
			...parsed.output,
			id: crypto.randomUUID(),
			spaceId: props.spaceId,
			code: generateServerGameCode(parsed.output),
			startedAt: null,
		});
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
				<Button type="submit" form={formId}>
					{t("createBoard.button")}
				</Button>
			</Card.Footer>
		</Card.Root>
	);
};
