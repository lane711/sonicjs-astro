import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations, type InferSelectModel } from "drizzle-orm";
import { auditSchema } from "./audit";
import * as posts from "./posts";
import * as comments from "./comments";
// import * as userKeys from "./userKeys";
// import * as userSessions from "./userSessions";
import { isAdmin, isAdminOrEditor, isAdminOrUser } from "../config-helpers";
import type { ApiConfig } from "../routes";
import { hashString } from "@services/cyrpt";
export const tableName = "users";
export const name = "Users";

export const route = "users";

export const definition = {
  id: text("id").primaryKey(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  email: text("email"),
  password: text("password"),
  role: text("role").$type<"admin" | "user">(),
};

export const table = sqliteTable(tableName, {
  ...definition,
  ...auditSchema,
});

export type User = InferSelectModel<typeof table>;


export const relation = relations(table, ({ many }) => ({
  posts: many(posts.table),
  comments: many(comments.table),
  // keys: many(userKeys.table),
  // sessions: many(userSessions.table),
}));

export const access: ApiConfig["access"] = {
  operation: {
    create: isAdmin,
    delete: isAdmin,
  },
  item: {
    // if a user tries to update a user and isn't the user that created the user the update will return unauthorized response
    update: isAdminOrUser,
  },
  fields: {
    id: {
      read: (ctx, value, doc) => {
        return isAdminOrEditor(ctx) || isAdminOrUser(ctx, doc.id);
      },
    },
    email: {
      read: (ctx, value, doc) => {
        return isAdminOrUser(ctx, doc.id);
      },
    },
    password: {
      update: isAdminOrUser,
    },
    role: {
      read: (ctx, value, doc) => {
        return isAdminOrUser(ctx, doc.id);
      },
      update: isAdmin,
    },
  },
};

export const hooks: ApiConfig["hooks"] = {
  resolveInput: {
    create: async (context, data) => {
      if (data.password) {
        data.password = await hashString(data.password);
      }
      // if (context.locals.runtime.user?.userId) {
      //   data.userId = ctx.get("user").userId;
      // }
      return data;
    },
    // update: (ctx, id, data) => {
    //   if (ctx.locals.get("user")?.userId) {
    //     data.userId = ctx.get("user").userId;
    //   }
    //   return data;
    // },
  },
};

