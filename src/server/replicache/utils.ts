export const getGameKey = (gameId: string) => {
	return `game/${gameId}/`;
};

type GetGameCellKeyArgs = {
	gameId: string;
	position: number;
};

export const getGameCellKey = ({ gameId, position }: GetGameCellKeyArgs) => {
	return `${getGameKey(gameId)}${position}`;
};
