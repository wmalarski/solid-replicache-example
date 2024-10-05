import type { Component, ComponentProps } from "solid-js";
import { useI18n } from "../contexts/i18n";
import { IconButton } from "./icon-button";
import { XIcon } from "./icons";
import { CloseTrigger } from "./styled/dialog";

export * as Dialog from "./styled/dialog";

export const DialogCloseXTrigger: Component<
	ComponentProps<typeof CloseTrigger>
> = (props) => {
	const { t } = useI18n();

	return (
		<CloseTrigger
			asChild={(props) => (
				<IconButton
					aria-label={t("dialog.close")}
					variant="ghost"
					size="sm"
					{...props()}
				/>
			)}
			position="absolute"
			top="2"
			right="2"
			{...props}
		>
			<XIcon />
		</CloseTrigger>
	);
};
