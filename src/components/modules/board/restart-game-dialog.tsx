import {
	type Component,
	type ComponentProps,
	Match,
	Switch,
	createSignal,
	createUniqueId,
} from "solid-js";
import { useI18n } from "~/components/contexts/i18n";
import { useReplicacheContext } from "~/components/contexts/replicache";
import { Button } from "~/components/ui/button";
import { Dialog, DialogCloseXTrigger } from "~/components/ui/dialog";
import { IconButton } from "~/components/ui/icon-button";
import { FrownIcon, LaughIcon, SmileIcon } from "~/components/ui/icons";
import { Stack } from "~/styled-system/jsx";
import { type ActionResult, parseValibotIssues } from "~/utils/validation";
import { CreateGameForm } from "../create-game/create-game-form";
import { generateServerGameCode, parseBoardConfig } from "../create-game/utils";
import { useGameData } from "./game-provider";

export const RestartGameDialog: Component = () => {
	const { t } = useI18n();

	const rep = useReplicacheContext();
	const data = useGameData();

	const formId = createUniqueId();
	const [result, setResult] = createSignal<ActionResult>();

	const onSubmit: ComponentProps<"form">["onSubmit"] = async (event) => {
		event.preventDefault();

		const { game } = data();

		const formData = new FormData(event.currentTarget);
		const parsed = await parseBoardConfig(formData);

		if (!parsed.success) {
			setResult(parseValibotIssues(parsed.issues));
			return;
		}

		await rep().mutate.resetGame({
			...parsed.output,
			id: crypto.randomUUID(),
			spaceId: game.spaceId,
			code: generateServerGameCode(parsed.output),
			previousGameId: game.id,
		});
	};

	return (
		<Dialog.Root>
			<Dialog.Trigger
				asChild={(props) => <IconButton {...props()} />}
				aria-label="Reset"
			>
				<Switch fallback={<SmileIcon />}>
					<Match when={data().clickedOnMine()}>
						<FrownIcon />
					</Match>
					<Match when={data().isSuccess()}>
						<LaughIcon />
					</Match>
				</Switch>
			</Dialog.Trigger>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content>
					<Stack gap="8" p="6">
						<Stack gap="1">
							<Dialog.Title>{t("createBoard.title")}</Dialog.Title>
							<form id={formId} onSubmit={onSubmit} method="post">
								<CreateGameForm initialData={data().game} result={result()} />
							</form>
						</Stack>
						<Stack gap="3" direction="row" width="full">
							<Dialog.CloseTrigger
								asChild={(props) => (
									<Button
										{...props()}
										type="submit"
										form={formId}
										width="full"
									/>
								)}
							>
								{t("createBoard.button")}
							</Dialog.CloseTrigger>
						</Stack>
					</Stack>
					<DialogCloseXTrigger />
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
};
