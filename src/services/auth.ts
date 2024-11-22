import { createSession, generateSessionToken, invalidateUserSessions } from "./sessions";
import { eq } from "drizzle-orm";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { table as userTable } from "@schema/users";
import { compareStringToHash } from "./cyrpt";

export const login = async (
  d1,
  email: string,
  password: string
): Promise<object> => {
  const db = drizzle(d1);

  const record = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));
  const user = record[0];

  const isPasswordCorrect = await compareStringToHash(password, user.password);

  if (isPasswordCorrect) {
    const token = generateSessionToken();
    // TODO: invalidate all user sessions could be async if we send session id that we don't want to invalidate
    await invalidateUserSessions(d1, user.id)

    const session = await createSession(d1, token, user.id);

    return {bearer: token, expires: session.activeExpires};
  }
};

