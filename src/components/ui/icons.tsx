import type { Component, ComponentProps } from "solid-js";

export const CheckIcon: Component<ComponentProps<"svg">> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			{...props}
		>
			<title>Check Icon</title>
			<path d="M20 6 9 17l-5-5" />
		</svg>
	);
};

export const MinusIcon: Component<ComponentProps<"svg">> = (props) => {
	return (
		<svg
			fill="none"
			height="24"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			viewBox="0 0 24 24"
			width="24"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<title>Minus Icon</title>
			<path d="M5 12h14" />
		</svg>
	);
};

export const XIcon: Component<ComponentProps<"svg">> = (props) => {
	return (
		<svg
			fill="none"
			height="24"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			viewBox="0 0 24 24"
			width="24"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<title>X Icon</title>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	);
};
