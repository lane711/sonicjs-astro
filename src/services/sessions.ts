// import { db, userSessions } from "./db.js";
import { table as userTable } from "@schema/users";
import type { User } from "@schema/users";
import { table as userSessions } from "@schema/userSessions";
import type { Session } from "@schema/userSessions";

import { eq } from "drizzle-orm";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";

// import type { User, Session } from "./db.js";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  d1: D1Database,
  token: string,
  userId: string
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId:  userId,
    idleExpires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).getTime(),
    activeExpires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).getTime(),
    createdOn: new Date(Date.now()).getTime(),
    updatedOn: new Date(Date.now()).getTime(),
  };
  console.log('session', session);
  const db = drizzle(d1);
  await db.insert(userSessions).values(session);
  return session;
}

export async function validateSessionToken(
  db: DrizzleD1Database,
  token: string
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({ user: userTable, session: userSessions })
    .from(userSessions)
    .innerJoin(userTable, eq(userSessions.user_id, userTable.id))
    .where(eq(userSessions.id, sessionId));
  if (result.length < 1) {
    return { session: null, user: null };
  }
  const { user, session } = result[0];
  if (Date.now() >= session.active_expires) {
    await db.delete(userSessions).where(eq(userSessions.id, session.id));
    return { session: null, user: null };
  }
  if (Date.now() >= session.active_expires - 1000 * 60 * 60 * 24 * 15) {
    session.active_expires = Date.now() + 1000 * 60 * 60 * 24 * 30;
    await db
      .update(userSessions)
      .set({
        active_expires: session.active_expires,
      })
      .where(eq(userSessions.id, session.id));
  }
  return { session, user };
}

export async function invalidateSession(
  db: DrizzleD1Database,
  sessionId: string
): Promise<void> {
  await db.delete(userSessions).where(eq(userSessions.id, sessionId));
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
