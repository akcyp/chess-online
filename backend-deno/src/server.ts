import { Application } from 'oak';
import { RedisStore, Session } from 'oak_sessions';

import { redis } from './redis.ts';

export type AppState = {
  session: Session;
};

export const app = new Application<AppState>();
app.addEventListener('error', (evt) => {
  console.log(evt.error);
});

const store = new RedisStore(redis);
app.use(Session.initMiddleware(store));
