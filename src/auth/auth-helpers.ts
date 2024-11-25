import { schema, tableSchemas } from '../db/routes';
import { drizzle } from 'drizzle-orm/d1';
import { isNotNull } from 'drizzle-orm';
// import { AppContext as APIContext } from '../../server';
import type { APIContext as AppContext } from 'astro';

import type { SonicJSFilter, ApiConfig } from '../db/routes';
import { getRecords } from '@/services/data';

export const hasUser = async (ctx: AppContext) => {
  const fn = async function () {
    const db = drizzle(ctx.locals.runtime.env.D1, schema);
    const data = await db.query.users.findMany({
      with: {
        keys: {
          where(fields) {
            return isNotNull(fields.hashed_password);
          }
        }
      }
    });
    const result = data.filter((user) => user.keys?.length > 0);
    return result;
  };

  const result = await getRecords(
    ctx,
    'custom',
    {},
    'hasUserWithKeyCheck',
    'd1',
    fn
  );
  return result.data.length > 0;
};
export async function getApiAccessControlResult(
  operationAccessControl:
    | boolean
    | ((...args: any[]) => boolean | Promise<boolean>),
  filterAccessControl:
    | boolean
    | ((...args: any[]) => boolean | Promise<boolean>)
    | SonicJSFilter
    | ((...args: any[]) => SonicJSFilter | Promise<SonicJSFilter>),
  itemAccessControl: boolean | ((...args: any[]) => boolean | Promise<boolean>),
  ctx: AppContext,
  ...args: any[]
) {
  let authorized: boolean | SonicJSFilter = await getAccessControlResult(
    operationAccessControl,
    ctx,
    args[0],
    args[2]
  );
  if (authorized) {
    authorized = await getItemAccessControlResult(
      itemAccessControl,
      ctx,
      args[0],
      args[1],
      args[2]
    );
  }
  if (authorized) {
    authorized = await getAccessControlResult(
      filterAccessControl,
      ctx,
      args[0],
      args[2]
    );
  }

  return authorized;
}

async function getAccessControlResult(
  accessControl:
    | boolean
    | ((...args: any[]) => boolean | Promise<boolean>)
    | SonicJSFilter
    | ((...args: any[]) => SonicJSFilter | Promise<SonicJSFilter>),
  ctx: AppContext,
  ...args: any[]
) {
  let authorized: boolean | SonicJSFilter = true;
  if (typeof accessControl !== 'function') {
    authorized = accessControl;
  } else {
    const acResult = accessControl(ctx, ...args);
    if (acResult instanceof Promise) {
      authorized = await acResult;
    } else {
      authorized = acResult;
    }
  }
  return authorized;
}
type OperationCreate = NonNullable<
  NonNullable<NonNullable<ApiConfig['access']>['operation']>['create']
>;

type OperationRead = NonNullable<
  NonNullable<NonNullable<ApiConfig['access']>['operation']>['read']
>;
type OperationUpdate = NonNullable<
  NonNullable<NonNullable<ApiConfig['access']>['operation']>['update']
>;
type OperationDelete = NonNullable<
  NonNullable<NonNullable<ApiConfig['access']>['operation']>['delete']
>;

type FilterRead = NonNullable<
  NonNullable<NonNullable<ApiConfig['access']>['filter']>['read']
>;

type FilterUpdate = NonNullable<
  NonNullable<NonNullable<ApiConfig['access']>['filter']>['update']
>;

type FilterDelete = NonNullable<
  NonNullable<NonNullable<ApiConfig['access']>['filter']>['delete']
>;

type ItemRead = NonNullable<
  NonNullable<NonNullable<ApiConfig['access']>['item']>['read']
>;

type ItemUpdate = NonNullable<
  NonNullable<NonNullable<ApiConfig['access']>['item']>['update']
>;

type ItemDelete = NonNullable<
  NonNullable<NonNullable<ApiConfig['access']>['item']>['delete']
>;
type AccessFields = NonNullable<ApiConfig['access']>['fields'];
export async function getOperationCreateResult(
  create: OperationCreate,
  ctx: AppContext,
  data: any
) {
  return !!(await getAccessControlResult(create, ctx, data));
}

export async function getOperationReadResult(
  read: OperationRead,
  ctx: AppContext,
  id: string
) {
  return !!(await getAccessControlResult(read, ctx, id));
}

export async function getOperationUpdateResult(
  update: OperationUpdate,
  ctx: AppContext,
  id: string,
  data: any
) {
  return !!(await getAccessControlResult(update, ctx, id, data));
}

export async function getOperationDeleteResult(
  del: OperationDelete,
  ctx: AppContext,
  id: string
) {
  return !!(await getAccessControlResult(del, ctx, id));
}

export async function getFilterReadResult(
  read: FilterRead,
  ctx: AppContext,
  id: string
) {
  return await getAccessControlResult(read, ctx, id);
}

export async function getFilterUpdateResult(
  update: FilterUpdate,
  ctx: AppContext,
  id: string,
  data: any
) {
  return await getAccessControlResult(update, ctx, id, data);
}

export async function getFilterDeleteResult(
  del: FilterDelete,
  ctx: AppContext,
  id: string
) {
  return await getAccessControlResult(del, ctx, id);
}

export async function getItemAccessControlResult(
  itemAccessControl: boolean | ((...args: any[]) => boolean | Promise<boolean>),
  ctx: AppContext,
  id?: string,
  table?: string,
  data?: any
) {
  let authorized = true;
  if (typeof itemAccessControl === 'boolean') {
    authorized = itemAccessControl;
  } else if (id && table && typeof itemAccessControl === 'function') {
    const doc = await getRecords(
      ctx,
      table,
      { id },
      `doc/${table}/${id}`,
      'fastest'
    );

    if (data) {
      authorized = !!(await getAccessControlResult(
        itemAccessControl,
        ctx,
        id,
        data,
        doc
      ));
    } else {
      authorized = !!(await getAccessControlResult(
        itemAccessControl,
        ctx,
        id,
        doc
      ));
    }
  }
  return authorized;
}

export async function getItemReadResult(
  read: ItemRead,
  ctx: AppContext,
  docs: any
) {
  let authorized = true;
  if (typeof read === 'boolean') {
    authorized = read;
  } else if (typeof read === 'function') {
    docs = Array.isArray(docs) ? docs : [docs];
    for (const doc of docs) {
      if (authorized) {
        authorized = !!(await getAccessControlResult(read, ctx, doc.id, doc));
      }
    }
  }
  return authorized;
}

export async function getItemUpdateResult(
  update: ItemUpdate,
  ctx: AppContext,
  id: string,
  data: any,
  table: string
) {
  let authorized: boolean | SonicJSFilter = true;
  if (typeof update !== 'function') {
    authorized = update;
  } else {
    const doc = await getRecords(
      ctx,
      table,
      { id },
      `doc/${table}/${id}`,
      'fastest'
    );

    authorized = await getAccessControlResult(update, ctx, id, data, doc);
  }
  return authorized;
}

export async function getItemDeleteResult(
  del: ItemDelete,
  ctx: AppContext,
  id: string,
  table: string
) {
  let authorized: boolean | SonicJSFilter = true;
  if (typeof del !== 'function') {
    authorized = del;
  } else {
    const doc = await getRecords(
      ctx,
      table,
      { id },
      `doc/${table}/${id}`,
      'fastest'
    );

    authorized = await getAccessControlResult(del, ctx, id, doc);
  }
  return authorized;
}
export async function filterCreateFieldAccess<D = any>(
  fields: AccessFields,
  ctx: AppContext,
  data: D
): Promise<D> {
  let result: D = data;
  if (fields) {
    if (typeof data === 'object' && data) {
      const newResult = {} as D;
      for (const key of Object.keys(data)) {
        const value = data[key];
        const access = fields[key]?.create;
        let authorized = true;
        if (typeof access === 'boolean') {
          authorized = access;
        } else if (typeof access === 'function') {
          const accessResult = access(ctx, data);
          if (typeof accessResult === 'boolean') {
            authorized = accessResult;
          } else {
            authorized = await accessResult;
          }
        }
        if (authorized) {
          newResult[key] = value;
        }
      }
      result = newResult;
    } else {
      throw new Error('Data must be an object');
    }
  }
  return result;
}

export async function filterReadFieldAccess<D = any>(
  fields: AccessFields,
  ctx: AppContext,
  doc: D
): Promise<D> {
  let result: D = doc;
  if (fields) {
    if (Array.isArray(doc)) {
      const promises = doc.map((d) => {
        return filterReadFieldAccess(fields, ctx, d);
      });
      const fieldResults = (await Promise.allSettled(
        promises
      )) as PromiseSettledResult<D>[];
      result = fieldResults.reduce((acc: any[], r) => {
        if (r.status === 'fulfilled') {
          acc.push(r.value);
        } else {
          console.error(r.reason);
        }
        return acc;
      }, []) as D;
    } else if (doc && typeof doc === 'object') {
      const newResult = {} as D;
      for (const key of Object.keys(doc)) {
        const value = doc[key];
        const access = fields[key]?.read;
        let authorized = true;
        if (typeof access === 'boolean') {
          authorized = access;
        } else if (typeof access === 'function') {
          const accessResult = access(ctx, value, doc);
          if (typeof accessResult === 'boolean') {
            authorized = accessResult;
          } else {
            authorized = await accessResult;
          }
        }
        newResult[key] = authorized ? value : null;
      }
      result = newResult;
    } else {
      console.error('How is doc not an array or object???');
    }
  }
  return result;
}

export async function filterUpdateFieldAccess<D = any>(
  fields: AccessFields,
  ctx: AppContext,
  id: string,
  data: D
): Promise<D> {
  let result: D = data;
  if (fields) {
    if (data && typeof data === 'object') {
      const newResult = {} as D;
      for (const key of Object.keys(data)) {
        const value = data[key];
        const access = fields[key]?.update;
        let authorized = true;
        if (typeof access === 'boolean') {
          authorized = access;
        } else if (typeof access === 'function') {
          const accessResult = access(ctx, id, data);
          if (typeof accessResult === 'boolean') {
            authorized = accessResult;
          } else {
            authorized = await accessResult;
          }
        }

        if (authorized) {
          newResult[key] = value;
        }
      }
      result = newResult;
    } else {
      throw new Error('Data must be an object');
    }
  }
  return result;
}
