import type { AppState } from './server.ts';
import { Router } from 'oak';

import { logger } from './logger.ts';
import { generateUsername } from './utils/generateUsername.ts';
import {
  gamePayloadValidator,
  lobbyPayloadValidator,
} from './validator/validator.ts';

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
  if (!ctx.isUpgradable) {
    ctx.throw(501);
    return;
  }
  const uuid = ctx.state.session.get('userUUID') as string;
  const ws = ctx.upgrade();
  ws.addEventListener('open', () => {
    logger.info(`User ${uuid} connected to lobby`);
  });
  ws.addEventListener('close', () => {
    logger.info(`User ${uuid} disconnected from lobby`);
  });
  ws.addEventListener('message', async (e) => {
    logger.info(`User ${uuid} sent message to lobby: ${e.data}`);
    const validationResult = await lobbyPayloadValidator(e.data);
    if (validationResult instanceof Error) {
      ws.send(JSON.stringify({ error: validationResult.message }));
      return;
    }
    const { type, instance } = validationResult;
    switch (type) {
      case 'createGame': {
        const { minutes, increment } = instance;
        logger.warn(`User: ${uuid} is creating game with following config`, {
          minutes,
          increment,
        });
        break;
      }
    }
  });
});

router.get('/ws/game/:id', (ctx) => {
  if (!ctx.isUpgradable) {
    ctx.throw(501);
    return;
  }
  const uuid = ctx.state.session.get('userUUID') as string;
  const ws = ctx.upgrade();
  ws.addEventListener('open', () => {
    logger.info(`User ${uuid} connected`);
  });
  ws.addEventListener('close', () => {
    logger.info(`User ${uuid} disconnected`);
  });
  ws.addEventListener('message', async (e) => {
    logger.info(`User ${uuid} sent message: ${e.data}`);
    const validationResult = await gamePayloadValidator(e.data);
    if (validationResult instanceof Error) {
      ws.send(JSON.stringify({ error: validationResult.message }));
      return;
    }
    const { type, instance } = validationResult;
    switch (type) {
      case 'play': {
        logger.warn(`User: ${uuid} is trying to play as ${instance.color}`);
        break;
      }
      case 'ready': {
        logger.warn(
          `User: ${uuid} is saying that is ${
            instance.ready ? 'ready' : 'not ready'
          }`,
        );
        break;
      }
      case 'move': {
        logger.warn(
          `User: ${uuid} is trying to move from ${instance.from} to ${instance.to} ${
            instance.promotion ? `with promotion ${instance.promotion}` : ''
          }`,
        );
        break;
      }
      case 'offerdraw': {
        logger.warn(`User: ${uuid} is trying to offer draw`);
        break;
      }
      case 'rematch': {
        logger.warn(`User: ${uuid} is trying to rematch`);
        break;
      }
      case 'resign': {
        logger.warn(`User: ${uuid} is trying to resign`);
        break;
      }
    }
  });
});
