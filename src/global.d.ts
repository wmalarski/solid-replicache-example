/// <reference types="@solidjs/start/env" />

interface ImportMetaEnv {
	readonly VITE_REPLICACHE_LICENSE_KEY: string;
	readonly VITE_SUPABASE_ANON_KEY: string;
	readonly VITE_SUPABASE_URL: string;
	readonly TURSO_AUTH_TOKEN: string;
	readonly TURSO_CONNECTION_URL: string;
}

// biome-ignore lint/correctness/noUnusedVariables: Needed
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
