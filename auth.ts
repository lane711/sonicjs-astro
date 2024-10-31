import NextAuth from "next-auth"
import Email from "next-auth/providers/email"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import {  accounts, sessions, users, verificationTokens } from "./src/db/schema/users"
import { drizzle } from "drizzle-orm/d1";
// const db = drizzle(process.env.DB_FILE_NAME!);
import type { APIContext } from "astro";

// let db: any;
// export const { handlers, auth } =  NextAuth({
const req = Astro.request;

  export const auth = (db) =>  NextAuth({

  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [Email],
})