/// <reference types="@solidjs/start/env" />

interface ImportMetaEnv {
	readonly VITE_REPLICACHE_LICENSE_KEY: string;
	readonly CONVEX_DEPLOYMENT: string;
	readonly CONVEX_URL: string;
}

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
