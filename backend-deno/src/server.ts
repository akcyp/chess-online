import { Application } from 'oak';
import { Session } from 'oak_sessions';

// import { RedisStore } from 'oak_sessions';
// import { redis } from './redis.ts';

export type AppState = {
  session: Session;
};

export const app = new Application<AppState>();
app.addEventListener('error', (evt) => {
  console.log(evt.error);
});

// const store = new RedisStore(redis);
// app.use(Session.initMiddleware(store));
app.use(Session.initMiddleware(undefined, {
  sessionCookieName: 'pfsession',
  cookieSetOptions: {
    httpOnly: true,
    maxAge: 24 * 60 * 1e3,
    sameSite: 'none',
    secure: true,
  },
}));
