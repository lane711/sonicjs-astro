import { adapter } from './adapter';
import type { Adapter } from './interface';
import type { Config } from './config';

import { hashPassword, validateHash } from './utils/crypto';
import { isValidDatabaseSession } from './utils/session';
import { isWithinExpiration } from './utils/date';
import { generateRandomString } from './utils/nanoid';

export class Auth {
  constructor(public config: Config) {}

  public passwordHash = {
    generate: hashPassword,
    validate: validateHash
  };

  private sessionExpiresIn = {
    activePeriod: 1000 * 60 * 60 * 24, // 1 day
    idlePeriod: 1000 * 60 * 60 * 24 * 14 // 14 days
  };

  private async generatePassword(password?: string | null) {
    const salt = generateRandomString(16);
    const hash =
      password ?
        await this.passwordHash.generate({
          password: password,
          salt,
          hash: this.config.password.hash,
          iterations: this.config.password.iterations,
          kdf: this.config.password.kdf
        })
      : null;
    if (hash) {
      if (hash.kdf === 'pbkdf2') {
        return `snc:$:${hash.hashedPassword}:$:${salt}:$:${hash.hash}:$:${hash.iterations}`;
      } else {
        return `lca:$:${hash.hashedPassword}`;
      }
    }
    return null;
  }

  private async getDatabaseSessionAndUser(sessionId: Adapter.SId) {
    const instance = await adapter.getSessionAndUser(this.config, sessionId);
    if (!instance) throw new Error('Session not found');
    if (
      !instance.session ||
      !isValidDatabaseSession(
        instance.session[this.config.colDef.session.idleExpires]
      )
    ) {
      throw new Error('Session expired');
    }
    if (!instance.user) throw new Error('User not found');
    return instance;
  }

  private getNewSessionExpiration(sessionExpiresIn?: {
    activePeriod?: number;
    idlePeriod?: number;
  }) {
    const activePeriodExpiresAt = new Date(
      new Date().getTime() +
        (sessionExpiresIn?.activePeriod ?? this.sessionExpiresIn.activePeriod)
    ).getTime();
    const idlePeriodExpiresAt = new Date(
      activePeriodExpiresAt +
        (sessionExpiresIn?.idlePeriod ?? this.sessionExpiresIn.idlePeriod)
    ).getTime();
    return { activePeriodExpiresAt, idlePeriodExpiresAt };
  }

  public async getUser(userId: Adapter.UId) {
    return adapter.getUser(this.config, userId);
  }

  public async getUserByEmail(email: string) {
    return adapter.getUserByEmail(this.config, email);
  }

  public async createUser({
    key,
    attributes,
    transaction
  }: {
    key:
      | ({ password: string | null } & Omit<
          Adapter.KeyInsertSchema,
          | Config['colDef']['key']['userId']
          | Config['colDef']['key']['hashedPassword']
        >)
      | null;
    attributes: Adapter.UserInsertSchema;
    transaction?: Adapter.DB;
  }) {
    const trx = transaction ?? this.config.db;
    if (key === null) {
      return adapter.setUser(this.config, attributes, null, trx);
    }

    return adapter.setUser(
      this.config,
      attributes,
      {
        ...key,
        hashed_password: await this.generatePassword(key.password)
      },
      trx
    );
  }

  public async updateUserAttributes(
    userId: Adapter.UId,
    attributes: Adapter.UserInsertSchema
  ) {
    return adapter.updateUser(this.config, userId, attributes);
  }

  public async deleteUser(userId: Adapter.UId) {
    return adapter.deleteUser(this.config, userId);
  }

  public async useKey({
    provider,
    providerUserId,
    password
  }: {
    provider: Adapter.KProvider;
    providerUserId: Adapter.KProviderUserId;
    password: string | null;
  }) {
    const databaseKey = await adapter.getKey(
      this.config,
      provider,
      providerUserId
    );
    if (!databaseKey) throw new Error('Key not found');
    const hashedPassword = databaseKey[this.config.colDef.key.hashedPassword];
    if (hashedPassword) {
      if (password === null) throw new Error('Password required');
      const isValid = await this.passwordHash.validate(
        password,
        hashedPassword
      );
      if (!isValid) throw new Error('Invalid password');
    }
    return databaseKey;
  }

  public async getSession(sessionId: Adapter.SId) {
    return {
      ...(await this.getDatabaseSessionAndUser(sessionId)),
      fresh: false
    };
  }

  public async getAllUserSessions(userId: Adapter.UId) {
    const sessions = await adapter.getSessionsByUserId(this.config, userId);
    return sessions
      .filter((session) =>
        isValidDatabaseSession(session[this.config.colDef.session.idleExpires])
      )
      .map((session) => ({
        ...session,
        fresh: false
      }));
  }

  public async validateSession(sessionId: Adapter.SId) {
    const { session, user } = await this.getDatabaseSessionAndUser(sessionId);
    const active =
      session &&
      isWithinExpiration(session[this.config.colDef.session.activeExpires]);
    if (active) {
      return {
        session,
        user,
        fresh: false
      };
    }
    const { activePeriodExpiresAt, idlePeriodExpiresAt } =
      this.getNewSessionExpiration();

    const databaseSession =
      session ?
        await adapter.updateSession(
          this.config,
          session[this.config.colDef.session.id],
          {
            [this.config.colDef.session.activeExpires]: activePeriodExpiresAt,
            [this.config.colDef.session.idleExpires]: idlePeriodExpiresAt
          }
        )
      : null;

    return {
      session: databaseSession,
      user,
      fresh: true
    };
  }

  public async createSession({
    userId,
    attributes,
    sessionId
  }: {
    userId: Adapter.UId;
    attributes: Omit<
      Adapter.SessionInsertSchema,
      | Config['colDef']['session']['id']
      | Config['colDef']['session']['userId']
      | Config['colDef']['session']['activeExpires']
      | Config['colDef']['session']['idleExpires']
    >;
    sessionId?: Adapter.SId;
  }) {
    const { activePeriodExpiresAt, idlePeriodExpiresAt } =
      this.getNewSessionExpiration();
    const token = sessionId ?? generateRandomString(40);
    const databaseUser = await adapter.getUser(this.config, userId);
    if (!databaseUser) throw new Error('User not found');

    const databaseSession = await adapter.setSession(this.config, {
      ...attributes,
      [this.config.colDef.session.id]: token,
      [this.config.colDef.session.userId]: userId,
      [this.config.colDef.session.activeExpires]: activePeriodExpiresAt,
      [this.config.colDef.session.idleExpires]: idlePeriodExpiresAt
    });

    return {
      session: databaseSession,
      user: databaseUser,
      fresh: false
    };
  }

  public async updateSessionAttributes(
    sessionId: Adapter.SId,
    attributes: Adapter.SessionUpdateSchema
  ) {
    return adapter.updateSession(this.config, sessionId, attributes);
  }

  public async invalidateSession(sessionId: Adapter.SId) {
    return adapter.deleteSession(this.config, sessionId);
  }

  public async invalidateAllUserSessions(
    userId: Adapter.UId,
    sessionsToKeep: Adapter.SId[]
  ) {
    return adapter.deleteSessionsByUserId(this.config, userId, sessionsToKeep);
  }

  public async deleteDeadUserSessions(userId: Adapter.UId) {
    const sessions = await adapter.getSessionsByUserId(this.config, userId);
    const deadSessions = sessions.filter(
      (session) =>
        !isValidDatabaseSession(session[this.config.colDef.session.idleExpires])
    );
    await adapter.deleteSessions(
      this.config,
      deadSessions.map((session) => session[this.config.colDef.session.id])
    );
  }

  public async createKey({
    userId,
    provider,
    providerUserId,
    password
  }: {
    userId: Adapter.UId;
    provider: Adapter.KProvider;
    providerUserId: Adapter.KProviderUserId;
    password: string | null;
  }) {
    return adapter.setKey(this.config, {
      [this.config.colDef.key.userId]: userId,
      [this.config.colDef.key.provider]: provider,
      [this.config.colDef.key.providerUserId]: providerUserId,
      hashed_password: password ? await this.generatePassword(password) : null
    });
  }

  public async deleteKey(
    provider: Adapter.KProvider,
    providerUserId: Adapter.KProviderUserId
  ) {
    return adapter.deleteKey(this.config, provider, providerUserId);
  }

  public async getKey(
    provider: Adapter.KProvider,
    providerUserId: Adapter.KProviderUserId
  ) {
    return adapter.getKey(this.config, provider, providerUserId);
  }

  public async getAllUserKeys(userId: Adapter.UId) {
    return adapter.getKeysByUserId(this.config, userId);
  }

  public async updateKeyPassword(
    provider: Adapter.KProvider,
    providerUserId: Adapter.KProviderUserId,
    password: string | null
  ) {
    return adapter.updateKey(this.config, provider, providerUserId, {
      [this.config.colDef.key.hashedPassword]:
        password ? await this.generatePassword(password) : null
    });
  }
}
