import { type Component, Show, createMemo } from "solid-js";
import { createSubscription } from "~/components/contexts/replicache";
import type { GameCell } from "~/server/cells/types";
import { getGameCellKey } from "~/server/replicache/utils";
import { type RecipeVariant, cva } from "~/styled-system/css";
import { useGameData } from "./game-provider";

export const DATA_POSITION_ATTRIBUTE = "data-position";

const buttonStyles = cva({
	base: {
		background: "#7C7C7C",
		fontFamily: "monospace",
		fontSize: "xl",
		fontWeight: "bolder",
		boxSizing: "border-box",
		color: "white",
		cursor: "pointer",
		display: "inline-block",
		textTransform: "uppercase",
		width: 7,
		height: 7,
		"&:focus,\n\t&:hover": { background: "#BCBCBC" },
	},
	variants: {
		color: {
			1: { color: "indigo" },
		},
		uncovered: {
			true: {
				background: "gray.10",
				borderRight: "1px inset rgba(255,255,255,.25)",
				borderTop: "1px inset rgba(255,255,255,.25)",
			},
			false: {
				borderBottom: "4px inset rgba(0,0,0,.5)",
				borderLeft: "4px inset rgba(0,0,0,.5)",
				borderRight: "4px inset rgba(255,255,255,.5)",
				borderTop: "4px inset rgba(255,255,255,.5)",
			},
		},
	},
});

type ButtonVariants = RecipeVariant<typeof buttonStyles>;

type BoardCellProps = {
	position: number;
	isUncovered: boolean;
	isPushed: boolean;
};

export const BoardCell: Component<BoardCellProps> = (props) => {
	const data = useGameData();

	const config = createMemo(() => {
		const { configs } = data();
		return configs.get(props.position);
	});

	const cell = createSubscription(async (tx) => {
		const { game } = data();
		return tx.get<GameCell>(
			getGameCellKey(game.spaceId, game.id, props.position),
		);
	});

	return (
		<button
			{...{ [DATA_POSITION_ATTRIBUTE]: config()?.position }}
			type="button"
			aria-label="block"
			class={buttonStyles({
				color: (config()?.count ?? 0) as ButtonVariants["color"],
				uncovered: props.isUncovered || (props.isPushed && !cell.value?.marked),
			})}
		>
			<Show when={!cell.value?.marked} fallback="F">
				<Show when={props.isUncovered}>
					<Show when={!config()?.hasMine} fallback="M">
						<Show when={(config()?.count ?? 0) > 0}>{config()?.count}</Show>
					</Show>
				</Show>
			</Show>
		</button>
	);
};
