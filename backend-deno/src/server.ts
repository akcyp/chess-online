import { Application } from 'oak';
import { Session } from 'oak_sessions';

export type AppState = {
  session: Session;
};

export const app = new Application<AppState>();
app.addEventListener('error', (evt) => {
  console.log(evt.error);
});

app.use(Session.initMiddleware(undefined, {
  sessionCookieName: 'pfsession',
  cookieSetOptions: {
    httpOnly: true,
    maxAge: 24 * 60 * 1e3,
    sameSite: 'none',
    secure: true,
  },
}));
