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

  // ctx.env.D1DATA = ctx.env.D1DATA;

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
  //   return ctx.text('Unauthorized', 401);
  // }
  // params.id = id;

  // const record = await getRecords(
  //   ctx,
  //   table,
  //   params,
  //   ctx.req.path,
  //   source || 'fastest',
  //   undefined
  // );

  let record = await getRecords(
    context,
    entry.table,
    { id: params.id },
    context.request.url,
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

//   //delete
//   api.delete(`/${entry.route}/:id`, async (ctx) => {
//     const id = ctx.req.param('id');
//     const table = ctx.req.path.split('/')[2];
//     ctx.env.D1DATA = ctx.env.D1DATA;

//     if (entry.hooks?.beforeOperation) {
//       await entry.hooks.beforeOperation(ctx, 'delete', id);
//     }

//     let { includeContentType, source, ...params } = ctx.req.query();

//     const accessControlResult = await getApiAccessControlResult(
//       entry?.access?.operation?.delete || true,
//       entry?.access?.filter?.delete || true,
//       entry?.access?.item?.delete || true,
//       ctx,
//       id,
//       entry.table
//     );

//     if (typeof accessControlResult === 'object') {
//       params = { ...params, ...accessControlResult };
//     }

//     if (!accessControlResult) {
//       return ctx.text('Unauthorized', 401);
//     }
//     params.id = id;

//     const record = await getRecords(
//       ctx,
//       table,
//       params,
//       ctx.req.path,
//       source || 'fastest',
//       undefined
//     );

//     if (record) {
//       console.log('content found, deleting...');
//       const result = await deleteRecord(ctx.env.D1DATA, ctx.env.KVDATA, {
//         id,
//         table: table
//       });
//       if (entry?.hooks?.afterOperation) {
//         await entry.hooks.afterOperation(ctx, 'delete', id, record, result);
//       }
//       // const kvDelete = await deleteKVById(ctx.env.KVDATA, id);
//       // const d1Delete = await deleteD1ByTableAndId(
//       //   ctx.env.D1DATA,
//       //   content.data.table,
//       //   content.data.id
//       // );
//       console.log('returning 204');
//       return ctx.text('', 204);
//     } else {
//       console.log('content not found');
//       return ctx.text('', 404);
//     }
//   });
// });

const return201 = (message = "Record Created") => {
  return new Response(
    JSON.stringify({
      message,
    }),
    { status: 201 }
  );
};

const return204 = (message = "Record Deleted") => {
  return new Response(null, { status: 204 });
};

const return400 = (message = "Unauthorized") => {
  return new Response(
    JSON.stringify({
      message,
    }),
    { status: 400 }
  );
};

const return404 = (message = "Not Found") => {
  return new Response(
    JSON.stringify({
      message,
    }),
    { status: 404 }
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
