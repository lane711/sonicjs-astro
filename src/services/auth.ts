import bcrypt from "bcrypt";
const saltRounds = 10;
import { createSession, generateSessionToken, invalidateUserSessions } from "./sessions";
import { eq } from "drizzle-orm";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { table as userTable } from "@schema/users";

export const login = async (
  d1,
  email: string,
  password: string
): Promise<string> => {
  const db = drizzle(d1);

  const record = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));
  const user = record[0];

  const isPasswordCorrect = await checkPassword(password, user.password);

  if (isPasswordCorrect) {
    const token = generateSessionToken();
    // TODO: invalidate all user sessions could be async if we send session id that we don't want to invalidate
    await invalidateUserSessions(d1, user.id)

    const session = createSession(d1, token, user.id);

    return token;
  }
};

function checkPassword(password, hashFromDb) {
  return new Promise(function (resolve, reject) {
    bcrypt.compare(password, hashFromDb, function (err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

// const checkPassword = async (password: string, hash: string): boolean => {
//   // Compare a password with its hash
//   await bcrypt.compare(password, hash, (err, result) => {
//     if (err) throw err;
//     if (result) {
//       // Passwords match
//       return true;
//     } else {
//       // Passwords do not match
//       return false;
//     }
//   });
// };

// // Hash a password
// bcrypt.hash('myPassword', saltRounds, (err, hash) => {
//   if (err) throw err;
//   // Store the hash in your database
//   console.log(hash);
// });

// // Compare a password with its hash
// bcrypt.compare('myPassword', hash, (err, result) => {
//   if (err) throw err;
//   if (result) {
//     // Passwords match
//   } else {
//     // Passwords do not match
//   }
// });
