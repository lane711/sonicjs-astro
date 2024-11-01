import auth from 'auth-astro';
import { D1Adapter } from "@auth/d1-adapter";
// import Email from "@auth/core/providers/email";
import Resend from "@auth/core/providers/resend";
import GitHub from "@auth/core/providers/github";

const AUTH_RESEND_KEY = "";
export function onRequest(context, next) {
  const env = context.locals.runtime.env;

   const { handlers, auth } = NextAuth({
    providers: [
        GitHub({
            clientId: import.meta.env.GITHUB_ID,
            clientSecret: import.meta.env.GITHUB_SECRET,
          })       
    ],
  })

//   const auth = NextAuth({
//     providers: [
//       Resend({
//         apiKey: AUTH_RESEND_KEY,
//         from: "no-reply@company.com",
//       }),
//     ],
//     adapter: D1Adapter(env.D1),
//   })(context.request);

  return next();
}
