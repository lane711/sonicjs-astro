import { login } from "@services/auth";
import { return200, return200WithObject, return500 } from "@services/return-types";
import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
    console.log('LOGIN POST');

    const contentType = context.request.headers.get("content-type");
    if (context.request.headers.get("content-type") === "application/json") {
        // Get the body of the request
        const body = await context.request.json();
        const { email, password } = body;

        const token = await login(context.locals.runtime.env.D1, email, password);

        console.log('body', body, email, password);
        return return200WithObject({bearer: token});
    }

    return return500();
};