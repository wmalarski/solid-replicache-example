import { useSubmission } from "@solidjs/router";
import { type Component, Show } from "solid-js";
import { useI18n } from "~/components/contexts/i18n";
import { Field } from "~/components/ui/field";
import { insertGameAction } from "~/server/replicache/client";
import {
	BOARD_MAX_MINES,
	BOARD_MAX_SIZE,
	BOARD_MIN_MINES,
	BOARD_MIN_SIZE,
} from "~/server/replicache/const";
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
					required
				/>
				<Show when={submission.result?.errors?.name}>
					<Field.ErrorText>{submission.result?.errors?.name}</Field.ErrorText>
				</Show>
			</Field.Root>

			<Field.Root>
				<Field.Label>{t("createBoard.columns.label")}</Field.Label>
				<Field.Input
					min={BOARD_MIN_SIZE}
					max={BOARD_MAX_SIZE}
					type="number"
					name="width"
					placeholder={t("createBoard.columns.placeholder")}
					required
				/>
				<Show when={submission.result?.errors?.width}>
					<Field.ErrorText>{submission.result?.errors?.width}</Field.ErrorText>
				</Show>
			</Field.Root>

			<Field.Root>
				<Field.Label>{t("createBoard.rows.label")}</Field.Label>
				<Field.Input
					min={BOARD_MIN_SIZE}
					max={BOARD_MAX_SIZE}
					type="number"
					name="height"
					placeholder={t("createBoard.rows.placeholder")}
					required
				/>
				<Show when={submission.result?.errors?.height}>
					<Field.ErrorText>{submission.result?.errors?.height}</Field.ErrorText>
				</Show>
			</Field.Root>

			<Field.Root>
				<Field.Label>{t("createBoard.mines.label")}</Field.Label>
				<Field.Input
					min={BOARD_MIN_MINES}
					max={BOARD_MAX_MINES}
					type="number"
					name="mines"
					placeholder={t("createBoard.mines.placeholder")}
					required
				/>
				<Show when={submission.result?.errors?.mines}>
					<Field.ErrorText>{submission.result?.errors?.mines}</Field.ErrorText>
				</Show>
			</Field.Root>
		</form>
	);
};
