import NextAuth from "next-auth"
// import { DrizzleAdapter } from "@auth/drizzle-adapter"
// import { db } from "./schema.ts"
import Email from "next-auth/providers/email"
 
// export const { handlers, auth, signIn, signOut } = NextAuth({
//   adapter: DrizzleAdapter(db),
//   providers: [Email],
// })


// import NextAuth from "next-auth"
// import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { accounts, sessions, users, verificationTokens } from "./src/db/schema/users"
 
export const { handlers, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [Email],
})