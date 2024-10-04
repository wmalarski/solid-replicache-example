import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { I18nContextProvider } from "./components/contexts/i18n";
import { ThemeProvider } from "./components/contexts/theme";
import { Head } from "./components/modules/common/head";

export default function App() {
	return (
		<Router
			root={(props) => (
				<ThemeProvider>
					<I18nContextProvider>
						<MetaProvider>
							<Head />
							<Suspense>{props.children}</Suspense>
						</MetaProvider>
					</I18nContextProvider>
				</ThemeProvider>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
