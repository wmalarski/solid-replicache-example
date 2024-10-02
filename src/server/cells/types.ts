export type GameCell = {
	gameId: string;
	positionX: number;
	positionY: number;
	marked: boolean;
	clicked: boolean;
};

export type GameCellWithID = GameCell & { id: string };
