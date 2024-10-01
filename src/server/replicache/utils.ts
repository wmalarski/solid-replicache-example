type GenerateServerGameCodeArgs = {
	width: number;
	height: number;
	mines: number;
};

export const generateServerGameCode = ({
	height,
	mines,
	width,
}: GenerateServerGameCodeArgs) => {
	const all = height * width;
	const mineCount = Math.max(Math.floor(all * mines), 1);

	const mineIndexes = new Set(
		Array.from({ length: all }, (_v, index) => ({
			random: Math.random(),
			index,
		}))
			.toSorted((a, b) => a.random - b.random)
			.slice(0, mineCount)
			.map((entry) => entry.index),
	);

	const code = Array.from({ length: all }, (_v, index) =>
		mineIndexes.has(index) ? "X" : "0",
	).join();

	return code;
};