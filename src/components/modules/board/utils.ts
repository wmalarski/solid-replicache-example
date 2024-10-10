import type { GameCell } from "~/server/cells/types";
import { stringifyCellId } from "~/server/replicache/utils";

export const LEFT_BUTTON = 0;
export const RIGHT_BUTTON = 2;

export type CellInfo = {
	position: string;
	neighbors: string[];
	count: number;
	lake?: string[];
	hasMine: boolean;
};

const getMinePositions = (cellCodes: string[], gameId: string) => {
	const minePositions = new Set<string>();

	cellCodes.forEach((cellCode, index) => {
		cellCode === "X" && minePositions.add(stringifyCellId(gameId, index));
	});

	return minePositions;
};

type GetNeighborsPositionsArgs = {
	index: number;
	columns: number;
	rows: number;
	gameId: string;
};

export const getNeighborsPositions = ({
	columns,
	index,
	rows,
	gameId,
}: GetNeighborsPositionsArgs) => {
	const cellX = index % columns;
	const cellY = Math.floor(index / columns);

	const fromX = Math.max(0, cellX - 1);
	const toX = Math.min(columns - 1, cellX + 1);
	const fromY = Math.max(0, cellY - 1);
	const toY = Math.min(rows - 1, cellY + 1);

	const neighbors: string[] = [];

	for (let x = fromX; x <= toX; x++) {
		for (let y = fromY; y <= toY; y++) {
			const neighbor = y * columns + x;
			if (neighbor !== index) {
				neighbors.push(stringifyCellId(gameId, neighbor));
			}
		}
	}

	return neighbors;
};

type GetCellInfosArgs = {
	cellCodes: string[];
	columns: number;
	rows: number;
	gameId: string;
};

export const getCellInfos = ({
	cellCodes,
	columns,
	rows,
	gameId,
}: GetCellInfosArgs) => {
	const configs = new Map<string, CellInfo>();
	const minePositions = getMinePositions(cellCodes, gameId);
	const positionsWithZero: string[] = [];
	const positions: string[] = [];

	cellCodes.forEach((_cellCode, index) => {
		const position = stringifyCellId(gameId, index);
		const neighbors = getNeighborsPositions({ index, columns, rows, gameId });

		const hasMine = minePositions.has(position);
		const mines = neighbors.filter((position) => minePositions.has(position));
		const count = mines.length;

		if (count < 1) {
			positionsWithZero.push(position);
		}

		positions.push(position);
		configs.set(position, { position, neighbors, hasMine, count });
	});

	updateLakes({ configs, positionsWithZero });

	return { configs, minePositions, positions };
};

type UpdateLakesArgs = {
	positionsWithZero: string[];
	configs: Map<string, CellInfo>;
};

const updateLakes = ({ positionsWithZero, configs }: UpdateLakesArgs) => {
	positionsWithZero.forEach((position) => {
		if (configs.get(position)?.lake) {
			return;
		}

		const lake: string[] = [];
		const queue = [position];

		while (queue.length > 0) {
			const index = queue.pop();

			if (!index) {
				continue;
			}

			lake.push(index);

			const info = configs.get(index);

			if (!info) {
				continue;
			}

			configs.set(index, { ...info, lake });

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
				.flatMap((index) => configs.get(index)?.neighbors ?? [])
				.filter((index) => !lake.includes(index)),
		);

		lake.push(...all);
	});
};

type GetUncoveredArgs = {
	cells: GameCell[];
	configs: Map<string, CellInfo>;
};

export const getUncovered = ({ cells, configs }: GetUncoveredArgs) => {
	const uncovered = new Set<string>();

	cells.forEach((cell) => {
		if (cell.clicked && !uncovered.has(cell.id)) {
			uncovered.add(cell.id);
			const cellConfig = configs.get(cell.id);

			if (!cellConfig?.hasMine) {
				cellConfig?.lake?.forEach((index) => uncovered.add(index));
			}
		}
	});

	return uncovered;
};
