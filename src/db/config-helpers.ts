import type { APIContext as AppContext } from 'astro';

export function isAdminOrEditor(ctx?: AppContext) {
  const user = ctx?.locals?.user;
  const role = user?.role?.toLowerCase() || '';
  if (role === 'admin' || role === 'editor') {
    return true;
  }
  return false;
}

export function isAdmin(ctx?: AppContext) {
  const user = ctx?.locals.user;
  const role = user?.role?.toLowerCase() || '';
  if (role === 'admin') {
    return true;
  }
  return false;
}

export function isUser(ctx?: AppContext, id?: string) {
  const user = ctx?.locals.user;
  return user?.id === id;
}

export function isAdminOrUser(ctx?: AppContext, id?: string) {
  return isAdmin(ctx) || isUser(ctx, id);
}
