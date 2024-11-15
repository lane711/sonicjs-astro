import { defineMiddleware } from "astro:middleware";
import {
	validateSessionToken,
	createSession,
	invalidateSession
} from "@services/sessions";

export const onRequest = defineMiddleware(async (context, next) => {
	// const db = context.locals.runtime.env.D1
	// const token = context.cookies.get("session")?.value ?? null;
	// if (token === null) {
	// 	context.locals.user = null;
	// 	context.locals.session = null;
	// 	return next();
	// }

	// const { session, user } = await validateSessionToken(db, token);
	// if (session !== null) {
	// 	createSession(db,  token, session.user_id);
	// } else {
	// 	invalidateSession(db, session.id);
	// }

	// context.locals.session = session;
	// context.locals.user = user;
	return next();
});