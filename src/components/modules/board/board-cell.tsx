import { nanoid } from "nanoid";
import { type Component, type ComponentProps, Show } from "solid-js";
import {
	createSubscription,
	useReplicacheContext,
} from "~/components/contexts/replicache";
import type { GameCell } from "~/server/cells/types";
import { getGameCellKey } from "~/server/replicache/utils";
import { type RecipeVariant, cva } from "~/styled-system/css";
import type { CellInfo } from "./utils";

const RIGHT_BUTTON = 2;

type BoardCellProps = {
	cellCode: string;
	gameId: string;
	position: number;
	cellState?: GameCell;
	cellInfo?: CellInfo;
	isUncovered: boolean;
};

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

export const BoardCell: Component<BoardCellProps> = (props) => {
	const rep = useReplicacheContext();

	const cell = createSubscription(async (tx) => {
		return tx.get<GameCell>(
			getGameCellKey({ gameId: props.gameId, position: props.position }),
		);
	});

	const onMouseUp: ComponentProps<"button">["onClick"] = async (event) => {
		const common = { position: props.position, gameId: props.gameId };

		console.log("event", props.isUncovered, cell.value, event.button);

		if (props.cellState?.clicked) {
			return;
		}

		if (cell.value && event.button === RIGHT_BUTTON) {
			await rep().mutate.updateCell({
				...common,
				id: cell.value.id,
				marked: !cell.value.marked,
				clicked: false,
			});
		} else if (!cell.value || event.button === RIGHT_BUTTON) {
			await rep().mutate.insertCell({
				...common,
				id: nanoid(),
				marked: event.button === RIGHT_BUTTON,
				clicked: event.button !== RIGHT_BUTTON,
			});
		}
	};

	return (
		<button
			onMouseUp={onMouseUp}
			type="button"
			aria-label="block"
			class={buttonStyles({
				color: (props.cellInfo?.count ?? 0) as ButtonVariants["color"],
				uncovered: props.isUncovered,
			})}
		>
			<Show when={!props.cellState?.marked} fallback="F">
				<Show when={props.isUncovered}>
					<Show when={!props.cellInfo?.hasMine} fallback="M">
						<Show when={props.cellInfo && props.cellInfo?.count > 0}>
							{props.cellInfo?.count}
						</Show>
					</Show>
				</Show>
			</Show>
		</button>
	);
};
