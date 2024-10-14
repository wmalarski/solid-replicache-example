import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
	middleware: "./src/middleware.ts",
	server: {
		preset: "cloudflare-pages",
		rollupConfig: {
			external: ["node:async_hooks"],
		},
	},
});
