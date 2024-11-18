/// <reference types="astro/client" />

type Auth = import('./auth/auth').Auth;

// use a default runtime configuration (advanced mode).
type Runtime = import('@astrojs/cloudflare').Runtime<Env>;
type KVNamespace = import('@cloudflare/workers-types').KVNamespace;
type ENV = {
  // replace `MY_KV` with your KV namespace
  //   MY_KV: KVNamespace;
  D1: D1Namespace;
};

declare namespace App {
  interface Locals extends Runtime {
    user: {};
    auth: Auth;
  }
}
