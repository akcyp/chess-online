import { Router } from 'oak';
import { generateUsername } from './utils/generateUsername.ts';
import type { AppState } from './server.ts';

export const router = new Router<AppState>();
router.use((ctx, next) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*');
  if (!ctx.state.session.has('userUUID')) {
    ctx.state.session.set('userUUID', crypto.randomUUID());
  }
  if (!ctx.state.session.has('username')) {
    ctx.state.session.set('username', generateUsername());
  }
  return next();
});

router.get('/ws/lobby', (ctx) => {
  const username = ctx.state.session.get('username');
  if (!ctx.state.session.has('pageCount')) {
    ctx.state.session.set('pageCount', 0);
  }
  const n = ctx.state.session.get('pageCount') as number;
  ctx.state.session.set('pageCount', n + 1);
  ctx.response.body = `Visited page ${n} times, your username = ${username}`;
});

router.get('/ws/game/:id', (ctx) => {
  if (!ctx.isUpgradable) {
    ctx.throw(501);
    return;
  }
  const uuid = ctx.state.session.get('userUUID') as string;
  const ws = ctx.upgrade();
  ws.addEventListener('open', () => {
    console.log(`User ${uuid} connected`);
  });
  ws.addEventListener('close', () => {
    console.log(`User ${uuid} disconnected`);
  });
  ws.addEventListener('message', (e) => {
    console.log(`User ${uuid} sent message: ${e.data}`);
  });
});
