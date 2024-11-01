import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

// import auth from "auth-astro";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [tailwind(), react()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});