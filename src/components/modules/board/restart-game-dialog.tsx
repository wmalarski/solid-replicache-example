import { type Component, Show, createUniqueId } from "solid-js";
import { useI18n } from "~/components/contexts/i18n";
import { Button } from "~/components/ui/button";
import { Dialog, DialogCloseXTrigger } from "~/components/ui/dialog";
import { IconButton } from "~/components/ui/icon-button";
import { FrownIcon, SmileIcon } from "~/components/ui/icons";
import { Stack } from "~/styled-system/jsx";
import { CreateGameForm } from "../create-game/create-game-form";
import { useGameData } from "./game-provider";

type RestartGameDialogProps = {
	hasClickedMine: boolean;
};

export const RestartGameDialog: Component<RestartGameDialogProps> = (props) => {
	const { t } = useI18n();

	const game = useGameData();

	const formId = createUniqueId();

	return (
		<Dialog.Root>
			<Dialog.Trigger
				asChild={(props) => <IconButton {...props()} />}
				aria-label="Reset"
			>
				<Show when={props.hasClickedMine} fallback={<SmileIcon />}>
					<FrownIcon />
				</Show>
			</Dialog.Trigger>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content>
					<Stack gap="8" p="6">
						<Stack gap="1">
							<Dialog.Title>{t("createBoard.title")}</Dialog.Title>
							<CreateGameForm initialData={game().game} formId={formId} />
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
