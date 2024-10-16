import { sqliteTable, index, text } from "drizzle-orm/sqlite-core";

import { relations } from "drizzle-orm";
import { auditSchema } from "./audit";
import * as users from "./users";
import * as categoriesToPosts from "./categoriesToPosts";
import * as comments from "./comments";
import { isAdmin, isAdminOrEditor } from "../config-helpers";
import type { ApiConfig } from "../routes";

export const tableName = "posts";

export const route = "posts";
export const name = "Posts";
export const icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>`;

export const definition = {
  id: text("id").primaryKey(),
  title: text("title"),
  body: text("body"),
  userId: text("userId"),
  image: text("image"),
  images: text("images", { mode: "json" }).$type<string[]>(),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
};

export const table = sqliteTable(
  tableName,
  {
    ...definition,
    ...auditSchema,
  },
  (table) => {
    return {
      userIdIndex: index("postUserIdIndex").on(table.userId),
    };
  }
);

export const relation = relations(table, ({ one, many }) => ({
  user: one(users.table, {
    fields: [table.userId],
    references: [users.table.id],
  }),
  categories: many(categoriesToPosts.table),
  comments: many(comments.table),
}));

export const access: ApiConfig["access"] = {
  operation: {
    read: true,
    create: isAdminOrEditor,
  },
  filter: {
    // if a user tries to update a post and isn't the user that created the post the update won't happen
    update: (ctx) => {
      if (isAdmin(ctx)) {
        return true;
      } else {
        const user = ctx.get("user");
        if (user?.userId) {
          // Return filter so update doesn't happen if userId doesn't match
          return {
            userId: user.userId,
          };
        } else {
          return false;
        }
      }
    },
    delete: (ctx) => {
      if (isAdmin(ctx)) {
        return true;
      } else {
        const user = ctx.get("user");
        if (user?.userId) {
          // Return filter so update doesn't happen if userId doesn't match
          return {
            userId: user.userId,
          };
        } else {
          return false;
        }
      }
    },
  },
  fields: {
    userId: {
      update: false,
    },
  },
};
export const hooks: ApiConfig["hooks"] = {
  resolveInput: {
    create: (ctx, data) => {
      if (ctx.locals.runtime.user?.userId) {
        data.userId = ctx.get("user").userId;
      }
      return data;
    },
    update: (ctx, id, data) => {
      if (ctx.locals.get("user")?.userId) {
        data.userId = ctx.get("user").userId;
      }
      return data;
    },
  },
};

export const fields: ApiConfig["fields"] = {
  // id: {
  //   type: "id",
  // },
  title: {
    type: "auto",
  },
  body: {
    type: "ckeditor",
  },
  image: {
    type: "file",
    bucket: (ctx) => ctx.env.R2STORAGE,
    path: "images",
  },
  images: {
    type: "file[]",
    bucket: (ctx) => ctx.env.R2STORAGE,
    path: "images",
  },
  tags: {
    type: "string[]",
  },
  body: {
    type: "ckeditor",
  },
  updatedOn: {
    type: "datetime",
  },
};
