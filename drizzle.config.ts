import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

try {
	config({ path: ".env.local" });
} catch {
	//
}

export default defineConfig({
	schema: "./src/server/db/schema.ts",
	out: "./drizzle/migrations/",
	dialect: "turso",
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		url: process.env.TURSO_CONNECTION_URL!,
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		authToken: process.env.TURSO_AUTH_TOKEN!,
	},
});
