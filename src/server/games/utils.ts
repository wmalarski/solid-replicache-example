import { decode } from "decode-formdata";
import * as v from "valibot";
import {
	BOARD_MAX_MINES,
	BOARD_MAX_SIZE,
	BOARD_MIN_MINES,
	BOARD_MIN_SIZE,
} from "./const";

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
	const mineCount = Math.max(Math.floor((all * mines) / 100), 1);

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
	).join("");

	return code;
};

export const parseBoardConfig = (formData: FormData) => {
	return v.safeParseAsync(
		v.object({
			width: v.pipe(
				v.number(),
				v.minValue(BOARD_MIN_SIZE),
				v.maxValue(BOARD_MAX_SIZE),
			),
			height: v.pipe(
				v.number(),
				v.minValue(BOARD_MIN_SIZE),
				v.maxValue(BOARD_MAX_SIZE),
			),
			name: v.string(),
			mines: v.pipe(
				v.number(),
				v.minValue(BOARD_MIN_MINES),
				v.maxValue(BOARD_MAX_MINES),
			),
		}),
		decode(formData, { numbers: ["mines", "height", "width"] }),
	);
};
