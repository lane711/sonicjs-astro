const bcrypt = require('bcrypt');
const saltRounds = 10;
import { createSession, generateSessionToken } from "./sessions"

export const login = async (db, email: string, password: string): Promise<string> => {
    const token = generateSessionToken();
    const session = createSession(db, token, email);
    return token;
}



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