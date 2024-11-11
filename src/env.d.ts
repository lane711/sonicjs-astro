/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type Auth = import('./auth/auth').Auth;

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    user: {};
    auth: Auth;
  }
}
