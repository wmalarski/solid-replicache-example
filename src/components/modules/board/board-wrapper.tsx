import {
	type Component,
	type ComponentProps,
	Show,
	createSignal,
	onMount,
} from "solid-js";
import Board from "~/components/modules/board/board";
import { LoadingPlaceholder } from "../common/loading-placeholder";

export const BoardWrapper: Component<ComponentProps<typeof Board>> = (
	props,
) => {
	const [isMount, setIsMount] = createSignal(false);

	onMount(() => {
		setIsMount(true);
	});

	return (
		<Show when={isMount()} fallback={<LoadingPlaceholder />}>
			<Board {...props} />
		</Show>
	);
};
