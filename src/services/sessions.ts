// import { db, sessionTable } from "./db.js";
import { table as userTable } from "@schema/users";
import type { User } from "@schema/users";
import { table as sessionTable } from "@schema/userSessions";
import type { Session } from "@schema/userSessions";

import { eq } from "drizzle-orm";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { DrizzleD1Database } from "drizzle-orm/d1";

// import type { User, Session } from "./db.js";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  db: DrizzleD1Database,
  token: string,
  userId: string
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    user_id:  userId,
    idle_expires: parseInt(new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toString()),
    active_expires: parseInt(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toString()),
    createdOn: parseInt(new Date(Date.now()).toString()),
    updatedOn: parseInt(new Date(Date.now()).toString()),
  };
  await db.insert(sessionTable).values(session);
  return session;
}

export async function validateSessionToken(
  db: DrizzleD1Database,
  token: string
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({ user: userTable, session: sessionTable })
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.user_id, userTable.id))
    .where(eq(sessionTable.id, sessionId));
  if (result.length < 1) {
    return { session: null, user: null };
  }
  const { user, session } = result[0];
  if (Date.now() >= session.active_expires) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return { session: null, user: null };
  }
  if (Date.now() >= session.active_expires - 1000 * 60 * 60 * 24 * 15) {
    session.active_expires = Date.now() + 1000 * 60 * 60 * 24 * 30;
    await db
      .update(sessionTable)
      .set({
        active_expires: session.active_expires,
      })
      .where(eq(sessionTable.id, session.id));
  }
  return { session, user };
}

export async function invalidateSession(
  db: DrizzleD1Database,
  sessionId: string
): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
