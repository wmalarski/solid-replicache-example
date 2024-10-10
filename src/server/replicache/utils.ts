const CELL_ID_SEPARATOR = "|";

export const parseCellId = (cellId: string) => {
	const [gameId, position] = cellId.split(CELL_ID_SEPARATOR);
	return { gameId, position: Number(position) };
};

export const stringifyCellId = (gameId: string, position: number) => {
	return `${gameId}|${position}`;
};

export const getGameCellsPrefix = (spaceId: string, gameId: string) => {
	return `space/${spaceId}/cells/${gameId}/`;
};

export const getGameCellKey = (
	spaceId: string,
	gameId: string,
	position: number,
) => {
	return `${getGameCellsPrefix(spaceId, gameId)}${position}`;
};

export const getGamePrefix = (spaceId: string) => {
	return `space/${spaceId}/configs/`;
};

export const getGameKey = (spaceId: string, gameId: string) => {
	return `${getGamePrefix(spaceId)}${gameId}/`;
};
