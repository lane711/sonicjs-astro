import NextAuth from "next-auth";
import Email from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "./src/db/schema/users";
import { drizzle } from "drizzle-orm/d1";
// const db = drizzle(process.env.DB_FILE_NAME!);
import type { APIContext } from "astro";

const env = import.meta.env;
const db = import.meta.env.D1;
// let db: any;
// export const { handlers, auth } =  NextAuth({

export const auth = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [Email],
});
