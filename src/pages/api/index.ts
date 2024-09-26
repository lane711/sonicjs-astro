export const prerender = false
import type { APIRoute } from 'astro'

export const GET: APIRoute = () => {
  return new Response(
    JSON.stringify({
      greeting: 'Hello',
    }),
  )
}