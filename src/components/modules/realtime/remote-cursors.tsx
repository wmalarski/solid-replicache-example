import { type Component, For, Show, createMemo } from "solid-js";
import { MousePointerIcon } from "~/components/ui/icons";
import type { Player } from "~/server/player/utils";
import { css } from "~/styled-system/css";
import { flex } from "~/styled-system/patterns";
import { getTextColor } from "~/utils/colors";
import { type PlayerCursorState, usePlayerCursors } from "./cursor-provider";
import { usePlayerPresence } from "./presence-provider";

type CursorProps = {
	state: PlayerCursorState;
	player: Player;
};

const Cursor: Component<CursorProps> = (props) => {
	const transform = createMemo(() => {
		const { x, y } = props.state;
		return `translate(${x}px, ${y}px)`;
	});

	return (
		<Show when={props.player.name}>
			<div
				class={flex({
					position: "absolute",
					gap: 1,
					top: 0,
					left: 0,
					padding: 0.5,
					paddingRight: 2,
					borderRadius: "full",
					fontSize: "md",
					fontFamily: "monospace",
					whiteSpace: "nowrap",
				})}
				style={{
					transform: transform(),
					"background-color": props.player.color,
					color: props.player.color && getTextColor(props.player.color),
				}}
			>
				<MousePointerIcon />
				{props.player.name}
			</div>
		</Show>
	);
};

export const RemoteCursors: Component = () => {
	const cursors = usePlayerCursors();
	const presence = usePlayerPresence();

	const playerIds = createMemo(() => {
		return Object.keys(cursors().cursors);
	});

	return (
		<div
			class={css({
				left: 0,
				top: 0,
				width: "full",
				height: "full",
				position: "absolute",
				borderColor: "white.a10",
				borderWidth: "thick",
				pointerEvents: "none",
				overflow: "clip",
			})}
		>
			<For each={playerIds()}>
				{(playerId) => (
					<Show when={cursors().cursors[playerId]}>
						{(state) => (
							<Show when={presence().players[playerId]}>
								{(player) => <Cursor player={player()} state={state()} />}
							</Show>
						)}
					</Show>
				)}
			</For>
		</div>
	);
};
