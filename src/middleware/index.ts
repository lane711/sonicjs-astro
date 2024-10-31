
// import { lucia } from "./auth";
import { defineMiddleware } from "astro:middleware";
import { lucia } from "../auth/auth";

export const onRequest = defineMiddleware(async (context, next) => {
	const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
	if (!sessionId) {
		context.locals.user = null;
		context.locals.session = null;
		return next();
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}
	context.locals.session = session;
	context.locals.user = user;
	return next();
});


// export function onRequest (context, next) {
//     // intercept data from a request
//     // optionally, modify the properties in `locals`
//     // context.locals.title = "New title ABC";
//     // context.locals.user = {username:'lane'};

//     console.log('00> hello middelware');

//     // return a Response or the result of calling `next()`
//     return next();

// };