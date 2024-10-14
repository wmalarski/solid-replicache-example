import { clientOnly } from "@solidjs/start";
import type { Component, ComponentProps } from "solid-js";

const Board = clientOnly(() => import("~/components/modules/board/board"));

export const BoardWrapper: Component<ComponentProps<typeof Board>> = (
	props,
) => {
	return <Board {...props} />;
};
