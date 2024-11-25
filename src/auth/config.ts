import type { Env } from '../../worker-configuration';
import { table as userSchema } from '@/db/schema/users';
import { table as keySchema } from '@/db/schema/userKeys';
import { table as sessionSchema } from '@/db/schema/userSessions';
import { drizzle } from 'drizzle-orm/d1';
import { schema } from '@/db/routes';

export const initializeConfig = (d1: D1Database, env: Env) => {
  return {
    db: drizzle(d1, schema),
    userSchema,
    keySchema,
    sessionSchema,
    colDef: {
      user: {
        id: 'id',
        email: 'email'
      },
      key: {
        userId: 'user_id',
        provider: 'provider',
        providerUserId: 'provider_user_id',
        hashedPassword: 'hashed_password'
      },
      session: {
        id: 'id',
        userId: 'user_id',
        activeExpires: 'active_expires',
        idleExpires: 'idle_expires'
      }
    },
    tableNames: {
      user: 'users',
      key: 'user_keys',
      session: 'user_sessions'
    },
    password: {
      hash: env.AUTH_HASH,
      kdf: env.AUTH_KDF,
      iterations: getIterations(env.AUTH_ITERATIONS)
    }
  } as const;
};
function getIterations(iterationsString?: string) {
  let iterations = 100000;
  if (iterationsString) {
    try {
      iterations = +iterationsString;
    } catch (e) {
      console.error('failed to parse AUTH_ITERATIONS', e);
    }
  }
  return Math.min(iterations, 100000);
}

export type Config = ReturnType<typeof initializeConfig>;
