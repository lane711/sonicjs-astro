import qs from "qs";

import type { APIRoute } from "astro";
import { getD1DataByTable } from "../../../../services/d1-data";
import { drizzle } from "drizzle-orm/d1";
import { apiConfig, sonicJsConfig } from "../../../../db/routes";
// import {
//   filterCreateFieldAccess,
//   filterReadFieldAccess,
//   getApiAccessControlResult,
//   getItemReadResult,
//   getOperationCreateResult,
// } from "../../../auth/auth-helpers";
import {
  deleteRecord,
  getRecords,
  insertRecord,
} from "../../../../services/data";
import { getApiAccessControlResult } from "../../../../auth/auth-helpers";
import { return200 } from "../../../../services/return-types";


  //get single record
  export const GET = async (context) => {
    

    // const start = Date.now();
    const params = context.params;

    const tableName = params.table;
    let entry;
    try {
      entry = apiConfig.filter((tbl) => tbl.route === tableName)[0];
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: `Table "${tableName}" not defined in your schema`,
        }),
        { status: 500 }
      );
    }

    // let { includeContentType, source, ...params } =  context.request.query();

    const id = params.id;

    if (entry.hooks?.beforeOperation) {
      await entry.hooks.beforeOperation(context, 'read', id);
    }

    // params.id = id;
    // will check the item result when we get the data
    const accessControlResult = await getApiAccessControlResult(
      entry?.access?.operation?.read || true,
      entry?.access?.filter?.read || true,
      true,
      context,
      id,
      entry.table
    );

    if (typeof accessControlResult === 'object') {
      params = { ...params, ...accessControlResult };
    }

    if (!accessControlResult) {
      return context.text('Unauthorized', 401);
    }

    // source = source || 'fastest';
    // if (includeContentType !== undefined) {
    //   source = 'd1';
    // }
    const source = 'D1'

    let data = await getRecords(
      context,
      entry.table,
      params,
       context.request.url,
      source,
      undefined
    );

    // if (entry.access?.item?.read) {
    //   const accessControlResult = await getItemReadResult(
    //     entry.access.item.read,
    //     ctx,
    //     data
    //   );
    //   if (!accessControlResult) {
    //     return context.text('Unauthorized', 401);
    //   }
    // }
    // data = await filterReadFieldAccess(entry.access?.fields, ctx, data);
    // if (includeContentType !== undefined) {
    //   data.contentType = getForm(ctx, entry.table);
    // }

    // if (entry.hooks?.afterOperation) {
    //   await entry.hooks.afterOperation(ctx, 'read', id, null, data);
    // }

    // const end = Date.now();
    // const executionTime = end - start;

    return return200(data);
  };


export const DELETE: APIRoute = async (context) => {
  const params = context.params;

  const id = params.id;

  const tableName = params.table;

  let entry;
  try {
    entry = apiConfig.filter((tbl) => tbl.route === tableName)[0];
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Table "${tableName}" not defined in your schema`,
      }),
      { status: 500 }
    );
  }

  // context.env.D1DATA = context.env.D1DATA;

  // if (entry.hooks?.beforeOperation) {
  //   await entry.hooks.beforeOperation(ctx, 'delete', id);
  // }

  // const accessControlResult = await getApiAccessControlResult(
  //   entry?.access?.operation?.delete || true,
  //   entry?.access?.filter?.delete || true,
  //   entry?.access?.item?.delete || true,
  //   ctx,
  //   id,
  //   entry.table
  // );

  // if (typeof accessControlResult === 'object') {
  //   params = { ...params, ...accessControlResult };
  // }

  // if (!accessControlResult) {
  //   return context.text('Unauthorized', 401);
  // }
  // params.id = id;

  // const record = await getRecords(
  //   ctx,
  //   table,
  //   params,
  //    context.request.path,
  //   source || 'fastest',
  //   undefined
  // );

  let record = await getRecords(
    context,
    entry.table,
    { id: params.id },
     context.requestuest.url,
    "fastest",
    undefined
  );

  if (record) {
    console.log("content found, deleting...");
    const result = await deleteRecord(context.locals.runtime.env.D1, {
      id,
      table: tableName,
    });
    // if (entry?.hooks?.afterOperation) {
    //   await entry.hooks.afterOperation(ctx, 'delete', id, record, result);
    // }

    console.log("returning 204");
    return return204();
  } else {
    console.log("content not found");
    return return404();
  }
};
