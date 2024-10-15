import { type Component, createEffect, onCleanup } from "solid-js";
import { useGameData } from "./game-provider";

const randomInRange = (min: number, max: number) => {
	return Math.random() * (max - min) + min;
};

const DURATION = 15 * 1000;
const DEFAULTS = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

type FireArgs = {
	particleCount: number;
	xMin: number;
	xMax: number;
	text?: string;
};

const fire = async ({ particleCount, xMin, xMax, text }: FireArgs) => {
	const module = await import("canvas-confetti");

	const shapes = text ? [module.default.shapeFromText({ text })] : undefined;

	module.default({
		...DEFAULTS,
		shapes,
		particleCount,
		origin: { x: randomInRange(xMin, xMax), y: Math.random() - 0.2 },
	});
};

type ConfettiProps = {
	enabled: boolean;
	text?: string;
};

export const Confetti: Component<ConfettiProps> = (props) => {
	createEffect(() => {
		if (!props.enabled) {
			return;
		}

		const animationEnd = Date.now() + DURATION;

		const timer = setInterval(() => {
			const timeLeft = animationEnd - Date.now();

			if (timeLeft <= 0) {
				return clearInterval(timer);
			}

			const particleCount = 50 * (timeLeft / DURATION);
			const text = props.text;
			fire({ particleCount, xMin: 0.1, xMax: 0.3, text }).then(() =>
				fire({ particleCount, xMin: 0.7, xMax: 0.9, text }),
			);
		}, 250);

		onCleanup(() => {
			clearInterval(timer);
		});
	});

	return <></>;
};

export const SuccessConfetti: Component = () => {
	const data = useGameData();
	return <Confetti enabled={data().isSuccess()} />;
};
