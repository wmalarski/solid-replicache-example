import { type Component, createEffect, onCleanup } from "solid-js";
import { useGameData } from "./game-provider";

const randomInRange = (min: number, max: number) => {
	return Math.random() * (max - min) + min;
};

const DURATION = 15 * 1000;
const DEFAULTS = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

const fire = async (particleCount: number, xMin: number, xMax: number) => {
	const module = await import("canvas-confetti");

	module.default({
		...DEFAULTS,
		particleCount,
		origin: { x: randomInRange(xMin, xMax), y: Math.random() - 0.2 },
	});
};

export const SuccessConfetti: Component = () => {
	const data = useGameData();

	createEffect(() => {
		const { isSuccess } = data();

		if (!isSuccess()) {
			return;
		}

		const animationEnd = Date.now() + DURATION;

		const timer = setInterval(() => {
			const timeLeft = animationEnd - Date.now();

			if (timeLeft <= 0) {
				return clearInterval(timer);
			}

			const particleCount = 50 * (timeLeft / DURATION);
			fire(particleCount, 0.1, 0.3).then(() => fire(particleCount, 0.7, 0.9));
		}, 250);

		onCleanup(() => {
			clearInterval(timer);
		});
	});

	return <></>;
};
