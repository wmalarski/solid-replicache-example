import { useSubmission } from "@solidjs/router";
import { type Component, Show } from "solid-js";
import { useI18n } from "~/components/contexts/i18n";
import { Field } from "~/components/ui/field";
import { insertGameAction } from "~/server/replicache/client";
import { flex } from "~/styled-system/patterns";

type CreateGameFormProps = {
	formId: string;
};

export const CreateGameForm: Component<CreateGameFormProps> = (props) => {
	const { t } = useI18n();

	const submission = useSubmission(insertGameAction);

	return (
		<form
			id={props.formId}
			action={insertGameAction}
			method="post"
			class={flex({ gap: "4", flexDirection: "column" })}
		>
			<Field.Root>
				<Field.Label>{t("createBoard.name.label")}</Field.Label>
				<Field.Input
					name="name"
					placeholder={t("createBoard.name.placeholder")}
				/>
				<Show when={submission.result?.errors?.name}>
					<Field.ErrorText>{submission.result?.errors?.name}</Field.ErrorText>
				</Show>
			</Field.Root>

			<Field.Root>
				<Field.Label>{t("createBoard.columns.label")}</Field.Label>
				<Field.Input
					min="5"
					max="20"
					type="number"
					name="width"
					placeholder={t("createBoard.columns.placeholder")}
				/>
				<Show when={submission.result?.errors?.width}>
					<Field.ErrorText>{submission.result?.errors?.width}</Field.ErrorText>
				</Show>
			</Field.Root>

			<Field.Root>
				<Field.Label>{t("createBoard.rows.label")}</Field.Label>
				<Field.Input
					min="5"
					max="20"
					type="number"
					name="height"
					placeholder={t("createBoard.rows.placeholder")}
				/>
				<Show when={submission.result?.errors?.height}>
					<Field.ErrorText>{submission.result?.errors?.height}</Field.ErrorText>
				</Show>
			</Field.Root>

			<Field.Root>
				<Field.Label>{t("createBoard.mines.label")}</Field.Label>
				<Field.Input
					min="10"
					max="90"
					type="number"
					name="mines"
					placeholder={t("createBoard.mines.placeholder")}
				/>
				<Show when={submission.result?.errors?.mines}>
					<Field.ErrorText>{submission.result?.errors?.mines}</Field.ErrorText>
				</Show>
			</Field.Root>
		</form>
	);
};
