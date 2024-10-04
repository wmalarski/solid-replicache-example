import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";
import { useI18n } from "~/components/contexts/i18n";

export default function NotFound() {
	const { t } = useI18n();

	return (
		<main>
			<Title>{t("notFound.title")}</Title>
			<HttpStatusCode code={404} />
			<h1>{t("notFound.title")}</h1>
		</main>
	);
}
