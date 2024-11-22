import { login } from "@services/auth";
import { hashString } from "@services/cyrpt";
import { return200, return200WithObject, return500 } from "@services/return-types";
import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
    console.log('LOGIN POST');

    const contentType = context.request.headers.get("content-type");
    if (context.request.headers.get("content-type") === "application/json") {

        
        // Get the body of the request
        const body = await context.request.json();
        const { email, password } = body;

        // const hashedPasseord =  await hashString(password);
        // console.log('hashedPasseord', hashedPasseord);
        
        const loginResult = await login(context.locals.runtime.env.D1, email, password);

        console.log('body', body, email, password);
        return return200WithObject({bearer: loginResult.bearer, expires: loginResult.expires});
    }

    return return500("Error: Content-Type must be application/json");
};