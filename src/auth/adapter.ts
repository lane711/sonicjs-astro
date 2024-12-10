// import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";

// import sqlite from "better-sqlite3";
// import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
// import { drizzle } from "drizzle-orm/better-sqlite3";

// const sqliteDB = sqlite(":memory:");
// const db = drizzle(sqliteDB);

// const userTable = sqliteTable("user", {
// 	id: text("id").primaryKey()
// });

// const sessionTable = sqliteTable("session", {
// 	id: text("id").primaryKey(),
// 	userId: text("user_id")
// 		.notNull()
// 		.references(() => userTable.id),
// 	expiresAt: integer("expires_at").notNull()
// });

// export const luciaAdapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);