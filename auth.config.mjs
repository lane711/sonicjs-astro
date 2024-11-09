import GitHub from "@auth/core/providers/github";
import { defineConfig } from "auth-astro";
import { drizzle } from "drizzle-orm/d1";
import Resend from "@auth/core/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
// const d1 = import.meta.env.D1;
// const db = drizzle(d1);

export default defineConfig({
  adapter: DrizzleAdapter(drizzle(import.meta.env.D1)),
  providers: [
    GitHub({
      clientId: import.meta.env.GITHUB_CLIENT_ID,
      clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
    }),
    Resend({
      apiKey: import.meta.env.RESEND_API_KEY,
      from: import.meta.env.SEND_EMAIL_FROM,
    }),
  ],
});

// export default defineConfig((ctx) => ({
// 	adapter: D1Adapter(ctx.locals.runtime.env.MY_DATABASE_BINDING),
// 	providers: [],
// }));
