// @refresh reload
import { StartServer, createHandler } from "@solidjs/start/server";
import { getAppThemeCookie } from "./server/theme/server";

export default createHandler(() => {
	const theme = getAppThemeCookie();

	return (
		<StartServer
			document={({ assets, children, scripts }) => (
				<html lang="en" data-color-mode={theme}>
					<head>
						<meta charset="utf-8" />
						<meta
							name="viewport"
							content="width=device-width, initial-scale=1"
						/>
						<link rel="icon" href="/favicon.ico" />
						{assets}
					</head>
					<body>
						<div id="app">{children}</div>
						{scripts}
					</body>
				</html>
			)}
		/>
	);
});
