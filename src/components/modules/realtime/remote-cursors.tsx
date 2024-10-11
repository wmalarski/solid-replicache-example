import {
	type Component,
	For,
	Show,
	createEffect,
	createMemo,
	onCleanup,
} from "solid-js";
import { MousePointerIcon } from "~/components/ui/icons";
import { css } from "~/styled-system/css";
import { getTextColor } from "~/utils/colors";
import { type PlayerCursorState, usePlayerCursors } from "./cursor-provider";
import { type PlayerState, usePlayerPresence } from "./presence-provider";

type CursorGraphicsProps = {
	state: PlayerCursorState;
	player: PlayerState;
};

const CursorGraphics: Component<CursorGraphicsProps> = (props) => {
	return (
		<div
			class={css({ position: "absolute" })}
			style={{
				top: `${props.state.y * window.innerHeight}px`,
				left: `${props.state.x * window.innerWidth}px`,
				"background-color": props.player.color,
				color: getTextColor(props.player.color),
			}}
		>
			<MousePointerIcon />
			<span>{props.player.name}</span>
		</div>
	);
};

export const RemoteCursors: Component = () => {
	const cursors = usePlayerCursors();
	const presence = usePlayerPresence();

	createEffect(() => {
		const listener = (event: MouseEvent) => {
			cursors().send({
				x: event.x / window.innerWidth,
				y: event.y / window.innerHeight,
			});
		};

		document.addEventListener("mousemove", listener);

		onCleanup(() => {
			document.removeEventListener("mousemove", listener);
		});
	});

	const playerIds = createMemo(() => {
		return Object.keys(cursors().cursors);
	});

	return (
		<For each={playerIds()}>
			{(playerId) => (
				<Show when={cursors().cursors[playerId]}>
					{(state) => (
						<Show when={presence()[playerId]}>
							{(player) => <CursorGraphics player={player()} state={state()} />}
						</Show>
					)}
				</Show>
			)}
		</For>
	);
};
