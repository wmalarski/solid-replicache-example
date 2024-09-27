export default {
	dialect: "sqlite",
	schema: "./src/server/db/schema.ts",
	out: "./drizzle/migrations/",
	driver: "better-sqlite",
	dbCredentials: {
		url: "./drizzle/db.sqlite",
	},
};
