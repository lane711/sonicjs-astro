import type { Config } from './config';

export declare namespace Adapter {
  export type DB = Config['db'];
  export type UId =
    Config['userSchema']['$inferSelect'][Config['colDef']['user']['id']];
  export type UserSelectSchema = Config['userSchema']['$inferSelect'];
  export type UserInsertSchema = Config['userSchema']['$inferInsert'];
  export type KUserId =
    Config['keySchema']['$inferSelect'][Config['colDef']['key']['userId']];
  export type KProvider =
    Config['keySchema']['$inferSelect'][Config['colDef']['key']['provider']];
  export type KProviderUserId =
    Config['keySchema']['$inferSelect'][Config['colDef']['key']['providerUserId']];
  export type KHashedPassword =
    Config['keySchema']['$inferSelect'][Config['colDef']['key']['hashedPassword']];
  export type KeySelectSchema = Config['keySchema']['$inferSelect'];
  export type KeyInsertSchema = Config['keySchema']['$inferInsert'];
  export type KeyUpdateSchema = Partial<Config['keySchema']['$inferSelect']>;
  export type SId =
    Config['sessionSchema']['$inferSelect'][Config['colDef']['session']['id']];
  export type SUserId =
    Config['sessionSchema']['$inferSelect'][Config['colDef']['session']['userId']];
  export type SActiveExpires =
    Config['sessionSchema']['$inferSelect'][Config['colDef']['session']['activeExpires']];
  export type SIdleExpires =
    Config['sessionSchema']['$inferSelect'][Config['colDef']['session']['idleExpires']];
  export type SessionSelectSchema = Config['sessionSchema']['$inferSelect'];
  export type SessionInsertSchema = Config['sessionSchema']['$inferInsert'];
  export type SessionUpdateSchema = Partial<
    Config['sessionSchema']['$inferSelect']
  >;
}

export type Adapter = {
  getUser(
    config: Config,
    userId: Adapter.UId
  ): Promise<Adapter.UserSelectSchema | null>;

  getUserByEmail(
    config: Config,
    email: string
  ): Promise<Adapter.UserSelectSchema | null>;

  setUser(
    config: Config,
    user: Adapter.UserInsertSchema,
    key: Omit<
      Adapter.KeyInsertSchema,
      Config['colDef']['key']['userId']
    > | null,
    tx?: Adapter.DB
  ): Promise<Adapter.UserSelectSchema>;

  updateUser(
    config: Config,
    userId: Adapter.UId,
    partial: Adapter.UserInsertSchema
  ): Promise<Adapter.UserSelectSchema>;

  deleteUser(config: Config, userId: Adapter.UId): Promise<void>;

  getKey(
    config: Config,
    provider: Adapter.KProvider,
    providerUserId: Adapter.KProviderUserId
  ): Promise<Adapter.KeySelectSchema | null>;

  getKeysByUserId(
    config: Config,
    userId: Adapter.UId
  ): Promise<Adapter.KeySelectSchema[]>;

  setKey(
    config: Config,
    key: Adapter.KeyInsertSchema
  ): Promise<Adapter.KeySelectSchema>;

  updateKey(
    config: Config,
    provider: Adapter.KProvider,
    providerUserId: Adapter.KProviderUserId,
    partialKey: Adapter.KeyUpdateSchema
  ): Promise<Adapter.KeySelectSchema>;

  deleteKey(
    config: Config,
    provider: Adapter.KProvider,
    providerUserId: Adapter.KProviderUserId
  ): Promise<void>;

  getSessionsByUserId(
    config: Config,
    userId: Adapter.UId
  ): Promise<Adapter.SessionSelectSchema[]>;

  setSession(
    config: Config,
    session: Adapter.SessionInsertSchema
  ): Promise<Adapter.SessionSelectSchema>;

  updateSession(
    config: Config,
    sessionId: Adapter.SId,
    partialSession: Adapter.SessionUpdateSchema
  ): Promise<Adapter.SessionSelectSchema>;

  deleteSession(config: Config, sessionId: Adapter.SId): Promise<void>;

  deleteSessions(config: Config, sessionIds: Adapter.SId[]): Promise<void>;

  deleteSessionsByUserId(
    config: Config,
    userId: Adapter.UId,
    sessionsToKeep: Adapter.SId[]
  ): Promise<void>;

  getSessionAndUser(
    config: Config,
    sessionId: Adapter.SId
  ): Promise<{
    session: Adapter.SessionSelectSchema | null;
    user: Adapter.UserSelectSchema | null;
  } | null>;
};
