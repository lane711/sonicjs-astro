export const prerender = false;
import qs from "qs";

import type { APIRoute } from "astro";
import { getD1DataByTable } from "../../../services/d1-data";
import { drizzle } from "drizzle-orm/d1";
import { apiConfig, sonicJsConfig } from "../../../db/routes";
import {
  filterReadFieldAccess,
  getApiAccessControlResult,
  getItemReadResult,
} from "../../../auth/auth-helpers";
import { getRecords } from "../../../services/data";

export const GET: APIRoute = async (context) => {
  const start = Date.now();
  const params = context.params;

  const tableName = params.table;
  let entry = apiConfig.filter((tbl) => tbl.table === tableName);
  if (entry.length) {
    entry = entry[0];
  } else {
    return new Response(
      JSON.stringify({
        error: `Table "${tableName}" not defined in your schema`,
      }),
      { status: 500 }
    );
  }

  const { env } = context.locals.runtime;
  // const db = drizzle(env.D1);

  const request = context.request;

  const query =
    request.url.indexOf("?") > 0 ? request.url.split("?")[1] : request.url;
  const queryParams = qs.parse(query, { duplicates: "combine" });

  console.log("queryParams", queryParams);

  // let data = await getD1DataByTable(env.D1, tableName, queryParams);

  if (entry.hooks?.beforeOperation) {
    await entry.hooks.beforeOperation(context, "read", params.id);
  }

  const accessControlResult = await getApiAccessControlResult(
    entry?.access?.operation?.read || true,
    entry?.access?.filter?.read || true,
    true,
    context,
    params.id,
    entry.table
  );

  if (typeof accessControlResult === "object") {
    params.accessControlResult = { ...accessControlResult };
  }

  if (!accessControlResult) {
    return context.text("Unauthorized", 401);
  }

  try {
    params.limit = params.limit ?? "100";

    // let data = await getD1DataByTable(env.D1, tableName, queryParams);
    let data = await getRecords(
      context,
      entry.table,
      params,
      context.request.url,
      "fastest",
      undefined
    );

    if (entry.access?.item?.read) {
      const accessControlResult = await getItemReadResult(
        entry.access.item.read,
        context,
        data
      );
      if (!accessControlResult) {
        return context.text("Unauthorized", 401);
      }
    }
    data.data = await filterReadFieldAccess(
      entry.access?.fields,
      context,
      data.data
    );

    if (entry.hooks?.afterOperation) {
      await entry.hooks.afterOperation(ctx, "read", params.id, null, data);
    }

    const end = Date.now();
    const executionTime = end - start;
    // timerLog('api get', start, end);

    // return ctx.json({ ...data, executionTime });
    return new Response(
      JSON.stringify({
        data,
        executionTime,
      })
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        error
      }),
      { status: 500 }
    );
  }
};
