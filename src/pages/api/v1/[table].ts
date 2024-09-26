import type { APIRoute } from 'astro';

const usernames = ["Sarah", "Chris", "Yan", "Elian"]

export const GET: APIRoute = ({ params, request }) => {
  const table = params.table;
  return new Response(
    JSON.stringify({
      table: table
    })
  )
}

export function getStaticPaths() {
  return [
    { params: { table: "contacts"} },
    { params: { table: "posts"} },
    { params: { table: "2"} },
    { params: { table: "3"} }
  ]
}