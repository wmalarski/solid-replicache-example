import { useSubmission } from "@solidjs/router";
import type { Component } from "solid-js";
import { useI18n } from "~/components/contexts/i18n";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { insertGameAction } from "~/server/replicache/client";
import { flex } from "~/styled-system/patterns";

export const CreateGameForm: Component = () => {
	const { t } = useI18n();

	const submission = useSubmission(insertGameAction);

	return (
		<form
			action={insertGameAction}
			class={flex({ gap: "4", alignItems: "flex-end" })}
		>
			<Field.Root>
				<Field.Label>{t("createBoard.name.label")}</Field.Label>
				<Field.Input
					name="name"
					placeholder={t("createBoard.name.placeholder")}
				/>
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
			</Field.Root>

			<Button type="submit" loading={submission.pending}>
				{t("createBoard.button")}
			</Button>
		</form>
	);
};
