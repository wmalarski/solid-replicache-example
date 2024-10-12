import { useSubmission } from "@solidjs/router";
import { type Component, createUniqueId } from "solid-js";
import { useI18n } from "~/components/contexts/i18n";
import { Button } from "~/components/ui/button";
import { Dialog, DialogCloseXTrigger } from "~/components/ui/dialog";
import {} from "~/components/ui/icons";
import { setPlayerDetailAction } from "~/server/player/client";
import type { Player } from "~/server/player/utils";
import { Stack } from "~/styled-system/jsx";
import { CreatePlayerForm } from "./update-player-form";

type UpdatePlayerDialogProps = {
	player: Player;
};

export const UpdatePlayerDialog: Component<UpdatePlayerDialogProps> = (
	props,
) => {
	const { t } = useI18n();

	const formId = createUniqueId();

	const submission = useSubmission(setPlayerDetailAction);

	return (
		<Dialog.Root open={!props.player.name}>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content>
					<Stack gap="4" p="6">
						<Stack gap="1">
							<Dialog.Title>{t("updatePlayer.title")}</Dialog.Title>
							<form id={formId} action={setPlayerDetailAction} method="post">
								<input type="hidden" name="id" value={props.player.id} />
								<CreatePlayerForm result={submission.result} />
							</form>
						</Stack>
						<Button
							type="submit"
							form={formId}
							width="full"
							loading={submission.pending}
						>
							{t("updatePlayer.button")}
						</Button>
					</Stack>
					<DialogCloseXTrigger />
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
};
