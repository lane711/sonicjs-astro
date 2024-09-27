export const prerender = false
import qs from 'qs';

import type { APIRoute } from 'astro';
import { getD1DataByTable } from '../../../services/d1-data';
import { drizzle } from 'drizzle-orm/d1';
// const { env } = Astro.locals.runtime;
// const db = drizzle(env.D1);

export const GET: APIRoute = async({ params, request }) => {
  const table = params.table;
  const start = Date.now();
  const query = request.url.indexOf('?') > 0 ? request.url.split('?')[1] : request.url;
  const queryParams = qs.parse(query, { duplicates: 'combine' });

  // let data = await getD1DataByTable(
  //   db,
  //   table,
  //   queryParams
  // ); p

  return new Response(
    JSON.stringify({
      table: table
    })
  )
}
