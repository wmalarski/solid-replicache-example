import { type Component, Show, createMemo } from "solid-js";
import { useThemeContext } from "~/components/contexts/theme";
import { MoonIcon, SunIcon } from "~/components/ui/icons";
import { css } from "~/styled-system/css";

export const ThemeToggle: Component = () => {
	const { theme, updateTheme } = useThemeContext();

	const isLight = createMemo(() => {
		return theme() === "light";
	});

	const onChange = () => {
		updateTheme(isLight() ? "dark" : "light");
	};

	return (
		<label
			class={css({
				position: "relative",
				display: "inline-grid",
				userSelect: "none",
				placeContent: "center",
				cursor: "pointer",
				"& > *": { gridColumnStart: 1, gridRowStart: 1 },
			})}
		>
			<input
				checked={isLight()}
				onChange={onChange}
				type="checkbox"
				class={css({ appearance: "none" })}
			/>
			<Show
				when={isLight()}
				fallback={<MoonIcon class={css({ width: 6, height: 6 })} />}
			>
				<SunIcon class={css({ width: 6, height: 6 })} />
			</Show>
		</label>
	);
};
