import 'reflect-metadata';

import { app } from './src/server.ts';
import { router } from './src/routes.ts';

if (import.meta.main) {
  app.use(router.routes());
  app.use(router.allowedMethods());

  await app.listen({
    port: 3000,
    secure: true,
    cert: Deno.readTextFileSync(
      Deno.env.get('CERT_PATH') ?? '../certificates/localhost.pem',
    ),
    key: Deno.readTextFileSync(
      Deno.env.get('CERT_KEY_PATH') ?? '../certificates/localhost-key.pem',
    ),
  });
}
