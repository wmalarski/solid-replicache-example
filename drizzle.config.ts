export default {
	dialect: "sqlite",
	schema: "./src/server/db/schema.ts",
	out: "./drizzle/migrations/",
	dbCredentials: { url: "./drizzle/db.sqlite" },
};
