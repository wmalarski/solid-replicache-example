export type CellInfo = {
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

const getNeighborsPositions = ({
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
	const cellInfos = new Map<number, CellInfo>();
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

		cellInfos.set(index, {
			neighbors: positions,
			hasMine: minePositions.has(index),
			count,
		});
	});

	updateLakes({ cellInfos, positionsWithZero });

	return cellInfos;
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
