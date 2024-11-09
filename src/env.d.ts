/// <reference types="astro/client" />

type KVNamespace = import("@cloudflare/workers-types").KVNamespace;
type D1Database = import("@cloudflare/workers-types").D1Database;

type ENV = {
  // replace `MY_KV` with your KV namespace
  //   MY_KV: KVNamespace;
  D1: D1Database;
};

// use a default runtime configuration (advanced mode).
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
  interface Locals extends Runtime {}
}

// /// <reference path="../.astro/types.d.ts" />
// /// <reference types="astro/client" />

// type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

// declare namespace App {
// 	interface Locals extends Runtime { user: {} }
// }
