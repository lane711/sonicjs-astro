// import { Lucia } from "lucia";
// import { luciaAdapter } from "./adapter";

// const adapter = new luciaAdapter(import.meta.env.D1); // your adapter

// export const lucia = new Lucia(adapter, {
// 	sessionCookie: {
// 		attributes: {
// 			// set to `true` when using HTTPS
// 			secure: import.meta.env.PROD
// 		}
// 	}
// });

// declare module "lucia" {
// 	interface Register {
// 		Lucia: typeof lucia;
// 	}
// }