import { and, eq, inArray, notInArray } from 'drizzle-orm';
import type { Adapter } from './interface';

export const adapter: Adapter = {
  getUser: async (config, userId) => {
    const [databaseUser] = await config.db
      .select()
      .from(config.userSchema)
      .where(eq(config.userSchema[config.colDef.user.id], userId))
      .limit(1);
    return databaseUser ?? null;
  },

  getUserByEmail: async (config, email) => {
    const [databaseUser] = await config.db
      .select()
      .from(config.userSchema)
      .where(eq(config.userSchema[config.colDef.user.email], email))
      .limit(1);
    return databaseUser ?? null;
  },

  setUser: async (config, user, key, transaction) => {
    const trx = transaction ?? config.db;
    if (!key) {
      const [databaseUser] = await trx
        .insert(config.userSchema)
        .values({
          ...user
        })
        .returning();
      if (!databaseUser) throw new Error("Couldn't create user");
      return databaseUser;
    }

    const [databaseUser] = await trx
      .insert(config.userSchema)
      .values({
        ...user
      })
      .returning();
    if (!databaseUser) throw new Error("Couldn't create user");

    const [databaseKey] = await trx
      .insert(config.keySchema)
      .values({
        ...key,
        [config.colDef.key.userId]: databaseUser[config.colDef.user.id]
      })
      .returning();
    if (!databaseKey) throw new Error("Couldn't create key");

    return databaseUser;
  },

  updateUser: async (config, userId, partialUser) => {
    const [databaseUser] = await config.db
      .update(config.userSchema)
      .set(partialUser)
      .where(eq(config.userSchema[config.colDef.user.id], userId))
      .returning();
    if (!databaseUser) throw new Error("Couldn't update user");
    return databaseUser;
  },

  deleteUser: async (config, userId) => {
    // order here is very important, no transaction required
    await config.db
      .delete(config.sessionSchema)
      .where(eq(config.sessionSchema[config.colDef.session.userId], userId));
    await config.db
      .delete(config.keySchema)
      .where(eq(config.keySchema[config.colDef.key.userId], userId));
    await config.db
      .delete(config.userSchema)
      .where(eq(config.userSchema[config.colDef.user.id], userId));
  },

  getKey: async (config, provider, providerUserId) => {
    const [databaseKey] = await config.db
      .select()
      .from(config.keySchema)
      .where(
        and(
          eq(config.keySchema[config.colDef.key.provider], provider),
          eq(config.keySchema[config.colDef.key.providerUserId], providerUserId)
        )
      )
      .limit(1);
    return databaseKey ?? null;
  },

  getSessionAndUser: async (config, sessionId) => {
    const [databaseSession] = await config.db
      .select()
      .from(config.sessionSchema)
      .where(eq(config.sessionSchema[config.colDef.session.id], sessionId))
      .leftJoin(
        config.userSchema,
        eq(
          config.userSchema[config.colDef.user.id],
          config.sessionSchema[config.colDef.session.userId]
        )
      )
      .limit(1);
    if (!databaseSession?.users) return null;

    return {
      session: databaseSession[config.tableNames.session],
      user: databaseSession[config.tableNames.user]
    };
  },

  getSessionsByUserId: async (config, userId) => {
    const databaseSessions = await config.db
      .select()
      .from(config.sessionSchema)
      .where(eq(config.sessionSchema[config.colDef.session.userId], userId));
    return databaseSessions;
  },

  updateSession: async (config, sessionId, partialSession) => {
    const [databaseSession] = await config.db
      .update(config.sessionSchema)
      .set(partialSession)
      .where(eq(config.sessionSchema[config.colDef.session.id], sessionId))
      .returning();
    if (!databaseSession) throw new Error("Couldn't update session");
    return databaseSession;
  },

  setSession: async (config, session) => {
    const [databaseSession] = await config.db
      .insert(config.sessionSchema)
      .values(session)
      .returning();
    if (!databaseSession) throw new Error("Couldn't create session");
    return databaseSession;
  },

  deleteSession: async (config, sessionId) => {
    await config.db
      .delete(config.sessionSchema)
      .where(eq(config.sessionSchema[config.colDef.session.id], sessionId));
  },

  deleteSessions: async (config, sessionIds) => {
    await config.db
      .delete(config.sessionSchema)
      .where(
        inArray(config.sessionSchema[config.colDef.session.id], sessionIds)
      );
  },

  deleteSessionsByUserId: async (config, userId, sessionsToKeep) => {
    await config.db
      .delete(config.sessionSchema)
      .where(
        and(
          eq(config.sessionSchema[config.colDef.session.userId], userId),
          notInArray(
            config.sessionSchema[config.colDef.session.id],
            sessionsToKeep
          )
        )
      );
  },

  setKey: async (config, key) => {
    const [databaseKey] = await config.db
      .insert(config.keySchema)
      .values(key)
      .returning();
    if (!databaseKey) throw new Error("Couldn't create key");
    return databaseKey;
  },

  deleteKey: async (config, provider, providerUserId) => {
    await config.db
      .delete(config.keySchema)
      .where(
        and(
          eq(config.keySchema[config.colDef.key.provider], provider),
          eq(config.keySchema[config.colDef.key.providerUserId], providerUserId)
        )
      );
  },

  getKeysByUserId: async (config, userId) => {
    const databaseKeys = await config.db
      .select()
      .from(config.keySchema)
      .where(eq(config.keySchema[config.colDef.key.userId], userId));
    return databaseKeys;
  },

  updateKey: async (config, provider, providerUserId, partialKey) => {
    const [databaseKey] = await config.db
      .update(config.keySchema)
      .set(partialKey)
      .where(
        and(
          eq(config.keySchema[config.colDef.key.provider], provider),
          eq(config.keySchema[config.colDef.key.providerUserId], providerUserId)
        )
      )
      .returning();
    if (!databaseKey) throw new Error("Couldn't update key");
    return databaseKey;
  }
};
