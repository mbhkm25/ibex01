import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _db: any = null;
if (process.env.DATABASE_URL) {
	const sql = neon(process.env.DATABASE_URL);
	_db = drizzle(sql, { schema });
} else {
	// Avoid calling `neon()` at build time when env vars are not set (e.g. during CI).
	// Export a proxy that throws when used so failures are delayed to runtime usage.
	_db = new Proxy({}, {
		get() {
			throw new Error("No database connection string provided. Set DATABASE_URL environment variable.");
		},
	});
}

export const db = _db;

