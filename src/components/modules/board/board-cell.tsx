import { nanoid } from "nanoid";
import {
	type Component,
	type ComponentProps,
	Show,
	createMemo,
} from "solid-js";
import {
	createSubscription,
	useReplicacheContext,
} from "~/components/contexts/replicache";
import type { GameCell } from "~/server/cells/types";
import { getGameCellKey } from "~/server/replicache/utils";
import { type RecipeVariant, cva } from "~/styled-system/css";
import { useGameData } from "./game-provider";

const RIGHT_BUTTON = 2;

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
};

export const BoardCell: Component<BoardCellProps> = (props) => {
	const rep = useReplicacheContext();
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

	const updateStartedAt = async () => {
		const { game } = data();

		if (!game.startedAt) {
			return;
		}

		await rep().mutate.updateGame({
			...game,
			startedAt: new Date().getTime(),
		});
	};

	const onMouseUp: ComponentProps<"button">["onClick"] = async (event) => {
		const { game } = data();
		const common = { position: props.position, gameId: game.id };

		if (cell.value?.clicked) {
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

		await updateStartedAt();
	};

	return (
		<button
			onMouseUp={onMouseUp}
			type="button"
			aria-label="block"
			class={buttonStyles({
				color: (config()?.count ?? 0) as ButtonVariants["color"],
				uncovered: props.isUncovered,
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
