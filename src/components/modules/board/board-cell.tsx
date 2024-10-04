import { nanoid } from "nanoid";
import type { Component, ComponentProps } from "solid-js";
import {
	createSubscription,
	useReplicacheContext,
} from "~/components/contexts/replicache";
import type { GameCell } from "~/server/cells/types";
import { getGameCellKey } from "~/server/replicache/utils";
import { css } from "~/styled-system/css";

type BoardCellProps = {
	cellCode: string;
	gameId: string;
	positionX: number;
	positionY: number;
};

export const BoardCell: Component<BoardCellProps> = (props) => {
	const rep = useReplicacheContext();

	const cell = createSubscription(async (tx) => {
		return tx.get<GameCell>(
			getGameCellKey({
				gameId: props.gameId,
				positionX: props.positionX,
				positionY: props.positionY,
			}),
		);
	});

	const onClick: ComponentProps<"button">["onClick"] = async (event) => {
		event.preventDefault();

		const common = {
			id: cell.value?.id || nanoid(),
			clicked: true,
			marked: false,
			positionX: props.positionX,
			positionY: props.positionY,
			gameId: props.gameId,
		};

		if (cell.value) {
			await rep().mutate.updateCell(common);
			return;
		}

		await rep().mutate.insertCell(common);
	};

	return (
		<button
			onClick={onClick}
			type="button"
			aria-label="block"
			class={css({
				background: "#7C7C7C",
				borderBottom: "4px inset rgba(0,0,0,.5)",
				borderLeft: "4px inset rgba(0,0,0,.5)",
				borderRight: "4px inset rgba(255,255,255,.5)",
				borderTop: "4px inset rgba(255,255,255,.5)",
				boxSizing: "border-box",
				color: "white",
				cursor: "pointer",
				display: "inline-block",
				textTransform: "uppercase",
				width: 6,
				height: 6,
				"&:focus,\n\t&:hover": { background: "#BCBCBC" },
			})}
		/>
	);
};
