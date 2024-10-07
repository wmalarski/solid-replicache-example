import {
	type Component,
	type ComponentProps,
	Show,
	createMemo,
	createUniqueId,
} from "solid-js";
import { useI18n } from "~/components/contexts/i18n";
import { Button } from "~/components/ui/button";
import { Dialog, DialogCloseXTrigger } from "~/components/ui/dialog";
import { IconButton } from "~/components/ui/icon-button";
import { FrownIcon, SmileIcon } from "~/components/ui/icons";
import { parseBoardConfig } from "~/server/games/utils";
import { Stack } from "~/styled-system/jsx";
import { CreateGameForm } from "../create-game/create-game-form";
import { useGameData } from "./game-provider";

export const RestartGameDialog: Component = () => {
	const { t } = useI18n();

	// const rep = useReplicacheContext();
	const data = useGameData();

	const formId = createUniqueId();

	const hasClickedMine = createMemo(() => {
		const { minePositions, cells } = data();
		return cells.value.some((cell) => minePositions.has(cell.position));
	});

	const onSubmit: ComponentProps<"form">["onSubmit"] = async (event) => {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const parsed = await parseBoardConfig(formData);

		console.log("parsed", parsed);

		if (!parsed.success) {
			return;
		}

		// rep().mutate.deleteCells
	};

	return (
		<Dialog.Root>
			<Dialog.Trigger
				asChild={(props) => <IconButton {...props()} />}
				aria-label="Reset"
			>
				<Show when={hasClickedMine()} fallback={<SmileIcon />}>
					<FrownIcon />
				</Show>
			</Dialog.Trigger>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content>
					<Stack gap="8" p="6">
						<Stack gap="1">
							<Dialog.Title>{t("createBoard.title")}</Dialog.Title>
							<form id={formId} onSubmit={onSubmit} method="post">
								<CreateGameForm initialData={data().game} />
							</form>
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
