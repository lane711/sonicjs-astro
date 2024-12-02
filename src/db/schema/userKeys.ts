import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { auditSchema } from './audit';
import * as users from './users';

export const tableName = 'user_keys';
export const name = 'User Keys';

export const definition = {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id')
    .notNull()
    .references(() => users.table.id),
  provider_user_id: text('provider_user_id', { length: 255 }).notNull(),
  provider: text('provider', { enum: ['EMAIL'] })
    .notNull()
    .default('EMAIL'),
  hashed_password: text('hashed_password')
};

export const table = sqliteTable(tableName, {
  ...definition,
  ...auditSchema
});
export const relation = relations(table, ({ one }) => ({
  user: one(users.table, {
    fields: [table.user_id],
    references: [users.table.id]
  })
}));
