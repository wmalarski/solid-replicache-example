import { type Component, Show } from "solid-js";
import { useI18n } from "~/components/contexts/i18n";
import { Field } from "~/components/ui/field";
import type { ActionResult } from "~/utils/validation";

type CreatePlayerFormProps = {
	result?: ActionResult;
};

export const CreatePlayerForm: Component<CreatePlayerFormProps> = (props) => {
	const { t } = useI18n();

	return (
		<Field.Root>
			<Field.Label>{t("updatePlayer.name.label")}</Field.Label>
			<Field.Input
				name="name"
				placeholder={t("updatePlayer.name.placeholder")}
				required
			/>
			<Show when={props.result?.errors?.name}>
				<Field.ErrorText>{props.result?.errors?.name}</Field.ErrorText>
			</Show>
		</Field.Root>
	);
};
