export const prerender = false;
import qs from "qs";

import type { APIRoute } from "astro";
import { getD1DataByTable } from "../../../services/d1-data";
import { drizzle } from "drizzle-orm/d1";
import { apiConfig } from "../../../db/routes";
const tables = apiConfig.filter((tbl) => tbl.table !== 'users');

export const GET: APIRoute = async (context) => {
  const { env } = context.locals.runtime;
  // const db = drizzle(env.D1);

  const params = context.params;
  const request = context.request;

  const table = params.table;
  const start = Date.now();
  const query =
    request.url.indexOf("?") > 0 ? request.url.split("?")[1] : request.url;
  const queryParams = qs.parse(query, { duplicates: "combine" });

  console.log("queryParams", queryParams);

  let data = await getD1DataByTable(env.D1, table, queryParams);

const tableConfig = apiConfig[table];

    if (table.hooks?.beforeOperation) {
      await table.hooks.beforeOperation(ctx, 'read', params.id);
    }

//     const accessControlResult = await getApiAccessControlResult(
//       entry?.access?.operation?.read || true,
//       entry?.access?.filter?.read || true,
//       true,
//       ctx,
//       params.id,
//       entry.table
//     );

//     if (typeof accessControlResult === 'object') {
//       params.accessControlResult = { ...accessControlResult };
//     }

//     if (!accessControlResult) {
//       return ctx.text('Unauthorized', 401);
//     }

//     try {
//       params.limit = params.limit ?? '1000';
//       ctx.env.D1DATA = ctx.env.D1DATA;
//       let data = await getRecords(
//         ctx,
//         entry.table,
//         params,
//         ctx.req.url,
//         'fastest',
//         undefined
//       );

//       if (entry.access?.item?.read) {
//         const accessControlResult = await getItemReadResult(
//           entry.access.item.read,
//           ctx,
//           data
//         );
//         if (!accessControlResult) {
//           return ctx.text('Unauthorized', 401);
//         }
//       }
//       data.data = await filterReadFieldAccess(
//         entry.access?.fields,
//         ctx,
//         data.data
//       );

//       if (entry.hooks?.afterOperation) {
//         await entry.hooks.afterOperation(ctx, 'read', params.id, null, data);
//       }

//       const end = Date.now();
//       const executionTime = end - start;
//       timerLog('api get', start, end);

//       return ctx.json({ ...data, executionTime });
//     } catch (error) {
//       console.log(error);
//       return ctx.text(error);
//     }

  return new Response(
    JSON.stringify({
      data
    })
  );
};
