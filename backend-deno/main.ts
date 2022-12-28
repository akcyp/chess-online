import 'reflect-metadata';

import { app } from './src/server.ts';
import { router } from './src/routes.ts';

const isProd = Deno.env.get('MODE') === 'PRODUCTION';

if (import.meta.main) {
  app.use(router.routes());
  app.use(router.allowedMethods());

  await app.listen({
    port: 3000,
    secure: true,
    cert: Deno.readTextFileSync(
      `${isProd ? '/certs/' : '../certificates/'}cert.pem`,
    ),
    key: Deno.readTextFileSync(
      `${isProd ? '/certs/' : '../certificates/'}key.pem`,
    ),
  });
}
