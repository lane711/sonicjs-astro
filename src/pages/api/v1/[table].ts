export const prerender = false

import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ params, request }) => {
  const table = params.table;
  return new Response(
    JSON.stringify({
      table: table
    })
  )
}
