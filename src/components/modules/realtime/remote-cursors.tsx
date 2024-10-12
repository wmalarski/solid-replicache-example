import {
	type Component,
	For,
	Show,
	createEffect,
	createMemo,
	onCleanup,
} from "solid-js";
import { MousePointerIcon } from "~/components/ui/icons";
import { flex } from "~/styled-system/patterns";
import { getTextColor } from "~/utils/colors";
import { type PlayerCursorState, usePlayerCursors } from "./cursor-provider";
import { type PlayerState, usePlayerPresence } from "./presence-provider";

type CursorProps = {
	state: PlayerCursorState;
	player: PlayerState;
};

const Cursor: Component<CursorProps> = (props) => {
	return (
		<div
			class={flex({
				position: "absolute",
				gap: 1,
				padding: 0.5,
				paddingRight: 2,
				borderRadius: "full",
				fontSize: "md",
				fontFamily: "monospace",
			})}
			style={{
				top: `${props.state.y * window.innerHeight}px`,
				left: `${props.state.x * window.innerWidth}px`,
				"background-color": props.player.color,
				color: getTextColor(props.player.color),
			}}
		>
			<MousePointerIcon />
			{props.player.name}
		</div>
	);
};

export const RemoteCursors: Component = () => {
	const cursors = usePlayerCursors();
	const presence = usePlayerPresence();

	createEffect(() => {
		const listener = (event: MouseEvent) => {
			cursors().send({
				x: event.clientX / window.innerWidth,
				y: event.clientY / window.innerHeight,
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
							{(player) => <Cursor player={player()} state={state()} />}
						</Show>
					)}
				</Show>
			)}
		</For>
	);
};
