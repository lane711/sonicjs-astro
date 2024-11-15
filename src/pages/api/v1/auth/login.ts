import { login } from "@services/auth";
import { return200 } from "@services/return-types";
import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
    console.log('LOGIN POST');

    const contentType = context.request.headers.get("content-type");
    if (context.request.headers.get("content-type") === "application/json") {
        // Get the body of the request
        const body = await context.request.json();
        const { email, password } = body;
        const token = login(context.locals.runtime.env.D1, email, password);

        console.log('body', body, email, password);
    }
    // api.post(`/${entry.route}`, async (ctx) => {
    const { env } = context.locals.runtime;
  
    const params = context.params;

    console.log('params', params);


    return return200({ message: "POST" });
};