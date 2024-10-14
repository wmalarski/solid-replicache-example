import { createMiddleware } from "@solidjs/start/middleware";
import { dbMiddleware } from "./server/db/middleware";

export default createMiddleware({
	onRequest: [dbMiddleware],
});
