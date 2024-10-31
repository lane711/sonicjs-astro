import {
  integer,
  sqliteTable,
  text,
  primaryKey,
} from "drizzle-orm/sqlite-core";
// import { createClient } from "@libsql/client"
// import { drizzle } from "drizzle-orm/libsql"
import { drizzle } from "drizzle-orm/d1";

import type { AdapterAccountType } from "next-auth/adapters";

// const client = createClient({
//   url: "DATABASE_URL",
//   authToken: "DATABASE_AUTH_TOKEN",
// })

// export const db = drizzle;

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const authenticators = sqliteTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: integer("credentialBackedUp", {
      mode: "boolean",
    }).notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);

// import { sqliteTable, text } from "drizzle-orm/sqlite-core";
// import { relations } from "drizzle-orm";
// import { auditSchema } from "./audit";
// import * as posts from "./posts";
// import * as comments from "./comments";
// import * as userKeys from "./userKeys";
// import * as userSessions from "./userSessions";
// import { isAdmin, isAdminOrEditor, isAdminOrUser } from "../config-helpers";
// import type { ApiConfig } from "../routes";
// export const tableName = "users";
// export const name = "Users";

// export const route = "users";

// export const definition = {
//   id: text("id").primaryKey(),
//   firstName: text("firstName"),
//   lastName: text("lastName"),
//   email: text("email"),
//   password: text("password"),
//   role: text("role").$type<"admin" | "user">(),
// };

// export const table = sqliteTable(tableName, {
//   ...definition,
//   ...auditSchema,
// });

// export const relation = relations(table, ({ many }) => ({
//   posts: many(posts.table),
//   comments: many(comments.table),
//   keys: many(userKeys.table),
//   sessions: many(userSessions.table),
// }));

// export const access: ApiConfig["access"] = {
//   operation: {
//     create: isAdmin,
//     delete: isAdmin,
//   },
//   item: {
//     // if a user tries to update a user and isn't the user that created the user the update will return unauthorized response
//     update: isAdminOrUser,
//   },
//   fields: {
//     id: {
//       read: (ctx, value, doc) => {
//         return isAdminOrEditor(ctx) || isAdminOrUser(ctx, doc.id);
//       },
//     },
//     email: {
//       read: (ctx, value, doc) => {
//         return isAdminOrUser(ctx, doc.id);
//       },
//     },
//     password: {
//       update: isAdminOrUser,
//     },
//     role: {
//       read: (ctx, value, doc) => {
//         return isAdminOrUser(ctx, doc.id);
//       },
//       update: isAdmin,
//     },
//   },
// };
