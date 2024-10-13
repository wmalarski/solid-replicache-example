import type { Component, ParentProps } from "solid-js";
import { useI18n } from "~/components/contexts/i18n";
import { LandPlotIcon } from "~/components/ui/icons";
import { Link } from "~/components/ui/link";
import { css } from "~/styled-system/css";
import { flex } from "~/styled-system/patterns";

import { paths } from "~/utils/paths";

export const PageTitle: Component = () => {
	const { t } = useI18n();

	return (
		<h1
			class={flex({
				my: 16,
				alignItems: "center",
				justifyItems: "center",
				textAlign: "center",
				fontSize: "4xl",
				textTransform: "uppercase",
				gap: 4,
				sm: {
					fontSize: "6xl",
				},
			})}
		>
			<LandPlotIcon class={css({ width: 12, height: 12 })} />
			<Link href={paths.home}>{t("seo.title")}</Link>
		</h1>
	);
};

export const PageFooter: Component = () => {
	const { t } = useI18n();

	return (
		<footer class={css({ p: 4 })}>
			<Link href={paths.repository} fontSize="xs">
				{t("info.madeBy")}
			</Link>
		</footer>
	);
};

export const FormLayout: Component<ParentProps> = (props) => {
	return (
		<main
			class={flex({
				mx: "auto",
				flexDirection: "column",
				alignItems: "center",
				p: 4,
			})}
		>
			{props.children}
			<PageFooter />
		</main>
	);
};

export const PageLayout: Component<ParentProps> = (props) => {
	return (
		<main class={flex({ mx: "auto", flexDir: "column", alignItems: "center" })}>
			{props.children}
			<PageFooter />
		</main>
	);
};
