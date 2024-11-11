import { defineMiddleware } from 'astro:middleware';
import { initializeConfig } from '@/auth/config';
import { Auth } from '@/auth/auth';

export const onRequest = defineMiddleware((context, next) => {
  const config = initializeConfig(
    context.locals.runtime.env.D1,
    context.locals.runtime.env
  );
  context.locals.auth = new Auth(config);
  context.locals.user = { username: 'lane' };

  console.log('bam middleware');

  return next();
});
