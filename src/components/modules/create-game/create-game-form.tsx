import { type Component, Show } from "solid-js";
import { useI18n } from "~/components/contexts/i18n";
import { Field } from "~/components/ui/field";
import {
	BOARD_MAX_MINES,
	BOARD_MAX_SIZE,
	BOARD_MIN_MINES,
	BOARD_MIN_SIZE,
} from "~/server/games/const";
import { Stack } from "~/styled-system/jsx";
import type { ActionResult } from "~/utils/validation";

export type CreateGameFormData = {
	name: string;
	width: number;
	height: number;
	mines: number;
};

type CreateGameFormProps = {
	initialData?: CreateGameFormData;
	result?: ActionResult;
};

export const CreateGameForm: Component<CreateGameFormProps> = (props) => {
	const { t } = useI18n();

	return (
		<Stack gap={4}>
			<Field.Root>
				<Field.Label>{t("createBoard.name.label")}</Field.Label>
				<Field.Input
					name="name"
					placeholder={t("createBoard.name.placeholder")}
					required
					value={props.initialData?.name}
				/>
				<Show when={props.result?.errors?.name}>
					<Field.ErrorText>{props.result?.errors?.name}</Field.ErrorText>
				</Show>
			</Field.Root>

			<Field.Root>
				<Field.Label>{t("createBoard.columns.label")}</Field.Label>
				<Field.Input
					min={BOARD_MIN_SIZE}
					max={BOARD_MAX_SIZE}
					type="number"
					name="width"
					value={props.initialData?.width}
					placeholder={t("createBoard.columns.placeholder")}
					required
				/>
				<Show when={props.result?.errors?.width}>
					<Field.ErrorText>{props.result?.errors?.width}</Field.ErrorText>
				</Show>
			</Field.Root>

			<Field.Root>
				<Field.Label>{t("createBoard.rows.label")}</Field.Label>
				<Field.Input
					min={BOARD_MIN_SIZE}
					max={BOARD_MAX_SIZE}
					type="number"
					name="height"
					value={props.initialData?.height}
					placeholder={t("createBoard.rows.placeholder")}
					required
				/>
				<Show when={props.result?.errors?.height}>
					<Field.ErrorText>{props.result?.errors?.height}</Field.ErrorText>
				</Show>
			</Field.Root>

			<Field.Root>
				<Field.Label>{t("createBoard.mines.label")}</Field.Label>
				<Field.Input
					min={BOARD_MIN_MINES}
					max={BOARD_MAX_MINES}
					type="number"
					name="mines"
					value={props.initialData?.mines}
					placeholder={t("createBoard.mines.placeholder")}
					required
				/>
				<Show when={props.result?.errors?.mines}>
					<Field.ErrorText>{props.result?.errors?.mines}</Field.ErrorText>
				</Show>
			</Field.Root>
		</Stack>
	);
};
