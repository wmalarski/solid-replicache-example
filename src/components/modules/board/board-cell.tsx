import { type Component, Show, createMemo } from "solid-js";
import { BombIcon, FlagTriangleRightIcon } from "~/components/ui/icons";
import { type RecipeVariant, cva } from "~/styled-system/css";
import { useGameData } from "./game-provider";

export const DATA_POSITION_ATTRIBUTE = "data-position";

const buttonStyles = cva({
	base: {
		fontFamily: "monospace",
		fontSize: "3xl",
		fontWeight: "extrabold",
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: 7,
		height: 7,
		userSelect: "none",
	},
	variants: {
		color: {
			0: { color: "#ffffff" },
			1: { color: "#75C7F0" },
			2: { color: "#71D083" },
			3: { color: "#EC6142" },
			4: { color: "#3E63DD" },
			5: { color: "#883447" },
			6: { color: "#246854" },
			7: { color: "#B5B3AD" },
			8: { color: "#EEEEF0" },
		},
		uncovered: {
			true: {
				background: "gray.2",
				borderRight: "1px inset rgba(255,255,255,.25)",
				borderTop: "1px inset rgba(255,255,255,.25)",
			},
			false: {
				background: "gray.5",
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
	position: string;
	isPushed: boolean;
};

export const BoardCell: Component<BoardCellProps> = (props) => {
	const data = useGameData();

	const config = createMemo(() => {
		const { configs } = data();
		return configs.get(props.position);
	});

	const isMarked = createMemo(() => {
		return data().positionsMarked().has(props.position);
	});

	const isUncovered = createMemo(() => {
		return data().uncovered().has(props.position);
	});

	const count = createMemo(() => {
		return config()?.count ?? 0;
	});

	return (
		<Show
			when={!data().clickedOnMine() || !config()?.hasMine}
			fallback={
				<span class={buttonStyles({ uncovered: true })}>
					<BombIcon />
				</span>
			}
		>
			<button
				{...{ [DATA_POSITION_ATTRIBUTE]: props.position }}
				type="button"
				aria-label="block"
				class={buttonStyles({
					color: isMarked() ? 0 : (count() as ButtonVariants["color"]),
					uncovered: isUncovered() || props.isPushed,
				})}
			>
				<Show
					when={isMarked()}
					fallback={<Show when={isUncovered() && count() > 0}>{count()}</Show>}
				>
					<FlagTriangleRightIcon stroke-width={3} />
				</Show>
			</button>
		</Show>
	);
};
