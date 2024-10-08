import qs from "qs";

import type { APIRoute } from "astro";
import { getD1DataByTable } from "../../../services/d1-data";
import { drizzle } from "drizzle-orm/d1";
import { apiConfig, sonicJsConfig } from "../../../db/routes";
import {
  filterCreateFieldAccess,
  filterReadFieldAccess,
  getApiAccessControlResult,
  getItemReadResult,
  getOperationCreateResult,
} from "../../../auth/auth-helpers";
import { getRecords, insertRecord } from "../../../services/data";

export const GET: APIRoute = async (context) => {
  const start = Date.now();
  const params = context.params;

  const tableName = params.table;
  let entry;
  try {
    entry = apiConfig.filter((tbl) => tbl.table === tableName)[0];
  } catch (error) {
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
    return new Response(
      JSON.stringify({
        error: `Unauthorized`,
      }),
      { status: 401 }
    );
  }

  try {
    params.limit = params.limit ?? "100";

    // let data = await getD1DataByTable(env.D1, tableName, queryParams);
    let data = await getRecords(
      context,
      entry.table,
      params,
      request.url,
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
        return return400();
      }
    }
    data.data = await filterReadFieldAccess(
      entry.access?.fields,
      context,
      data.data
    );

    if (entry.hooks?.afterOperation) {
      await entry.hooks.afterOperation(context, "read", params.id, null, data);
    }

    const end = Date.now();
    const executionTime = end - start;
    // timerLog('api get', start, end);

    // return context.json({ ...data, executionTime });
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
        error,
      }),
      { status: 500 }
    );
  }
};

//create single record
//TODO: support batch inserts
export const POST: APIRoute = async (context) => {
  // api.post(`/${entry.route}`, async (ctx) => {
  const { env } = context.locals.runtime;

  const params = context.params;

  const route = params.table;
  let entry;
  try {
    entry = apiConfig.filter((tbl) => tbl.route === route)[0];
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Table "${tableName}" not defined in your schema`,
      }),
      { status: 500 }
    );
  }

  // const db = drizzle(env.D1);

  const request = context.request;

  let content = {};
  content.data = await request.json();
  // const table = apiConfig.find((entry) => entry.route === route).table;
  // context.env.D1DATA = context.env.D1DATA;

  if (entry.hooks?.beforeOperation) {
    await entry.hooks.beforeOperation(content, "create", undefined, content);
  }

  content.table = entry.table;

  // let authorized = await getOperationCreateResult(
  //   entry?.access?.operation?.create,
  //   content,
  //   content.data
  // );
  // if (!authorized) {
  //   return return400();
  // }

  try {
    // console.log("posting new record content", JSON.stringify(content, null, 2));
    // content.data = await filterCreateFieldAccess(
    //   entry?.access?.fields,
    //   context,
    //   content.data
    // );
    // if (entry?.hooks?.resolveInput?.create) {
    //   content.data = await entry.hooks.resolveInput.create(
    //     context,
    //     content.data
    //   );
    // }
    console.log("posting new record content filtered?", content.data);
    const result = await insertRecord(env.D1, {}, content);
    console.log("create result", result);

    if (entry?.hooks?.afterOperation) {
      await entry.hooks.afterOperation(
        context,
        "create",
        result?.data?.["id"],
        content,
        result
      );
    }
    return new Response(
      JSON.stringify({
        data: result?.data
      }), {status: 201});
  } catch (error) {
    console.log("error posting content", error);
    return return500(error);
  }
};

const return400 = (message = "Unauthorized") => {
  return new Response(
    JSON.stringify({
      message,
    }),
    { status: 400 }
  );
};

const return500 = (message = "Internal Server Error") => {
  return new Response(
    JSON.stringify({
      message,
    }),
    { status: 500 }
  );
};
