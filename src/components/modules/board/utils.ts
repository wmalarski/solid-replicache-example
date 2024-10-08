import type { GameCell } from "~/server/cells/types";

export const LEFT_BUTTON = 0;
export const RIGHT_BUTTON = 2;

export type CellInfo = {
	position: number;
	neighbors: number[];
	count: number;
	lake?: number[];
	hasMine: boolean;
};

const getMinePositions = (cellCodes: string[]) => {
	const minePositions = new Set<number>();

	cellCodes.forEach((cellCode, index) => {
		if (cellCode === "X") {
			minePositions.add(index);
		}
	});

	return minePositions;
};

type GetNeighborsPositionsArgs = {
	index: number;
	columns: number;
	rows: number;
};

export const getNeighborsPositions = ({
	columns,
	index,
	rows,
}: GetNeighborsPositionsArgs) => {
	const cellX = index % columns;
	const cellY = Math.floor(index / columns);

	const fromX = Math.max(0, cellX - 1);
	const toX = Math.min(columns - 1, cellX + 1);
	const fromY = Math.max(0, cellY - 1);
	const toY = Math.min(rows - 1, cellY + 1);

	const positions: number[] = [];

	for (let x = fromX; x <= toX; x++) {
		for (let y = fromY; y <= toY; y++) {
			const position = y * columns + x;
			if (position !== index) {
				positions.push(position);
			}
		}
	}

	return positions;
};

type GetCellInfosArgs = {
	cellCodes: string[];
	columns: number;
	rows: number;
};

export const getCellInfos = ({
	cellCodes,
	columns,
	rows,
}: GetCellInfosArgs) => {
	const configs = new Map<number, CellInfo>();
	const minePositions = getMinePositions(cellCodes);
	const positionsWithZero = new Array<number>();

	cellCodes.forEach((_cellCode, index) => {
		const positions = getNeighborsPositions({
			index,
			columns,
			rows,
		});

		const count = positions.filter((position) =>
			minePositions.has(position),
		).length;

		if (count < 1) {
			positionsWithZero.push(index);
		}

		configs.set(index, {
			position: index,
			neighbors: positions,
			hasMine: minePositions.has(index),
			count,
		});
	});

	updateLakes({ cellInfos: configs, positionsWithZero });

	return { configs, minePositions };
};

type UpdateLakesArgs = {
	positionsWithZero: number[];
	cellInfos: Map<number, CellInfo>;
};

const updateLakes = ({ positionsWithZero, cellInfos }: UpdateLakesArgs) => {
	positionsWithZero.forEach((position) => {
		if (cellInfos.get(position)?.lake) {
			return;
		}

		const lake = new Array<number>();
		const queue = [position];

		while (queue.length > 0) {
			const index = queue.pop();

			if (index === undefined) {
				continue;
			}

			lake.push(index);

			const info = cellInfos.get(index);

			if (!info) {
				continue;
			}

			cellInfos.set(index, { ...info, lake });
			const zeroNeighbors = info.neighbors.filter(
				(neighbor) =>
					positionsWithZero.includes(neighbor) &&
					!lake.includes(neighbor) &&
					!queue.includes(neighbor),
			);

			queue.push(...zeroNeighbors);
		}

		const all = new Set(
			lake
				.flatMap((index) => cellInfos.get(index)?.neighbors ?? [])
				.filter((index) => !lake.includes(index)),
		);

		lake.push(...all);
	});
};

type GetUncoveredArgs = {
	cells: GameCell[];
	configs: Map<number, CellInfo>;
};

export const getUncovered = ({ cells, configs }: GetUncoveredArgs) => {
	const uncovered = new Set<number>();

	cells.forEach((cell) => {
		if (cell.clicked && !uncovered.has(cell.position)) {
			uncovered.add(cell.position);
			const cellConfig = configs.get(cell.position);

			if (!cellConfig?.hasMine) {
				cellConfig?.lake?.forEach((index) => uncovered.add(index));
			}
		}
	});

	return uncovered;
};
