import { type Component, createUniqueId } from "solid-js";
import { useI18n } from "~/components/contexts/i18n";
import { Button } from "~/components/ui/button";
import { Dialog, DialogCloseXTrigger } from "~/components/ui/dialog";
import { Stack } from "~/styled-system/jsx";
import {
	CreateGameForm,
	type CreateGameFormData,
} from "../create-game/create-game-form";

type RestartGameDialogProps = {
	initialData: CreateGameFormData;
};

export const RestartGameDialog: Component<RestartGameDialogProps> = (props) => {
	const { t } = useI18n();

	const formId = createUniqueId();

	return (
		<Dialog.Root>
			<Dialog.Trigger asChild={(props) => <Button {...props()} />}>
				Open Dialog
			</Dialog.Trigger>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content>
					<Stack gap="8" p="6">
						<Stack gap="1">
							<Dialog.Title>{t("createBoard.title")}</Dialog.Title>
							<CreateGameForm initialData={props.initialData} formId={formId} />
						</Stack>
						<Stack gap="3" direction="row" width="full">
							<Button type="submit" form={formId} width="full">
								{t("createBoard.button")}
							</Button>
						</Stack>
					</Stack>
					<DialogCloseXTrigger />
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
};
