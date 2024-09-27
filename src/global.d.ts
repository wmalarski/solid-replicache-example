/// <reference types="@solidjs/start/env" />

interface ImportMetaEnv {
	readonly VITE_REPLICACHE_LICENSE_KEY: string;
	DB_URL: string;
	DB_MIGRATIONS_URL: string;
	SITE_NAME: string;
	SESSION_SECRET: string;
}

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
