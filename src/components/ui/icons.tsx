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

export const MoonIcon: Component<ComponentProps<"svg">> = (props) => {
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
			<title>Moon Icon</title>
			<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
		</svg>
	);
};

export const SunIcon: Component<ComponentProps<"svg">> = (props) => {
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
			<title>Sun Icon</title>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2" />
			<path d="M12 20v2" />
			<path d="m4.93 4.93 1.41 1.41" />
			<path d="m17.66 17.66 1.41 1.41" />
			<path d="M2 12h2" />
			<path d="M20 12h2" />
			<path d="m6.34 17.66-1.41 1.41" />
			<path d="m19.07 4.93-1.41 1.41" />
		</svg>
	);
};

export const LandPlotIcon: Component<ComponentProps<"svg">> = (props) => {
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
			<title>Land Plot Icon</title>
			<path d="m12 8 6-3-6-3v10" />
			<path d="m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12" />
			<path d="m6.49 12.85 11.02 6.3" />
			<path d="M17.51 12.85 6.5 19.15" />
		</svg>
	);
};

export const SmileIcon: Component<ComponentProps<"svg">> = (props) => {
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
			<title>Smile Icon</title>
			<circle cx="12" cy="12" r="10" />
			<path d="M8 14s1.5 2 4 2 4-2 4-2" />
			<line x1="9" x2="9.01" y1="9" y2="9" />
			<line x1="15" x2="15.01" y1="9" y2="9" />
		</svg>
	);
};

export const FrownIcon: Component<ComponentProps<"svg">> = (props) => {
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
			<title>Frown Icon</title>
			<circle cx="12" cy="12" r="10" />
			<path d="M16 16s-1.5-2-4-2-4 2-4 2" />
			<line x1="9" x2="9.01" y1="9" y2="9" />
			<line x1="15" x2="15.01" y1="9" y2="9" />
		</svg>
	);
};

export const FlagTriangleRightIcon: Component<ComponentProps<"svg">> = (
	props,
) => {
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
			<title>Flag Triangle Right Icon</title>
			<path d="M7 22V2l10 5-10 5" />
		</svg>
	);
};

export const BombIcon: Component<ComponentProps<"svg">> = (props) => {
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
			<title>Bomb Icon</title>
			<circle cx="11" cy="13" r="9" />
			<path d="M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95" />
			<path d="m22 2-1.5 1.5" />
		</svg>
	);
};
