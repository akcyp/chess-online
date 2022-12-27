import type { AppState } from './server.ts';
import { isHttpError, Router, Status } from 'oak';

import { logger } from './logger.ts';
import { LobbyManager } from './core/LobbyManager.ts';
import { generateUsername } from './utils/generateUsername.ts';
import {
  gamePayloadValidator,
  lobbyPayloadValidator,
} from './validator/validator.ts';
import { WSUser } from './core/WSUser.ts';

export const router = new Router<AppState>();
export const lobbyManager = new LobbyManager();

router.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (isHttpError(err)) {
      switch (err.status) {
        case Status.NotFound:
          ctx.response.status = 404;
          break;
        case Status.NotImplemented:
          ctx.response.status = 501;
          break;
        default:
          logger.error(err.message);
      }
    } else {
      throw err;
    }
  }
});

router.use((ctx, next) => {
  ctx.response.headers.set(
    'Access-Control-Allow-Origin',
    'https://localhost:4000',
  );
  ctx.response.headers.set('Access-Control-Allow-Credentials', 'true');
  ctx.response.headers.set('Access-Control-Allow-Headers', '*');
  if (!ctx.state.session.has('userUUID')) {
    ctx.state.session.set('userUUID', crypto.randomUUID());
  }
  if (!ctx.state.session.has('username')) {
    ctx.state.session.set('username', generateUsername());
  }
  return next();
});

router.get('/api/lobby', (ctx) => {
  ctx.response.body = {
    username: ctx.state.session.get('username') as string,
  };
});

router.get('/ws/lobby', (ctx) => {
  if (!ctx.isUpgradable) {
    ctx.throw(501);
    return;
  }
  const user = new WSUser({
    uuid: ctx.state.session.get('userUUID') as string,
    username: ctx.state.session.get('username') as string,
    ws: ctx.upgrade(),
    parseData: async (data) => {
      return await lobbyPayloadValidator(data);
    },
  });
  user.on('connection', () => {
    logger.info(`User ${user.username} connected to lobby`);
    lobbyManager.addUser(user);
  }).on('disconnect', () => {
    logger.info(`User ${user.username} disconnected from lobby`);
  }).on('message', (data) => {
    logger.info(`User ${user.username} sent message to lobby: ${data}`);
  });
});

router.get('/api/game/:id', (ctx) => {
  const id = ctx.params.id;
  const room = lobbyManager.getGameRoom(id);
  if (room) {
    ctx.response.body = {
      ...room.getPreview(),
      auth: {
        username: ctx.state.session.get('username') as string,
      },
    };
  } else {
    ctx.throw(404);
  }
});

router.get('/ws/game/:id', (ctx) => {
  if (!ctx.isUpgradable) {
    ctx.throw(501);
    return;
  }
  const room = lobbyManager.getGameRoom(ctx.params.id);
  if (room === null) {
    ctx.throw(404);
    return;
  }
  const user = new WSUser({
    uuid: ctx.state.session.get('userUUID') as string,
    username: ctx.state.session.get('username') as string,
    ws: ctx.upgrade(),
    parseData: async (data) => {
      return await gamePayloadValidator(data);
    },
  });
  user.on('connection', () => {
    logger.info(`User ${user.username} connected`);
    room.addUser(user);
  }).on('disconnect', () => {
    logger.info(`User ${user.username} disconnected`);
  }).on('message', (data) => {
    logger.info(`User ${user.username} sent message: ${data}`);
  }).on('message:parse:success', (data) => {
    switch (data.type) {
      case 'play': {
        const { color } = data.instance;
        logger.warn(`User: ${user.username} is trying to play as ${color}`);
        break;
      }
      case 'ready': {
        const readyText = data.instance.ready ? 'ready' : 'not ready';
        logger.warn(`User: ${user.username} is saying that is ${readyText}`);
        break;
      }
      case 'move': {
        const { from, to, promotion } = data.instance;
        const pText = promotion ? ` with promotion ${promotion}` : '';
        logger.warn(`User: ${user.username} is moving ${from}-${to}${pText}`);
        break;
      }
      case 'offerdraw': {
        logger.warn(`User: ${user.username} is trying to offer draw`);
        break;
      }
      case 'rematch': {
        logger.warn(`User: ${user.username} is trying to rematch`);
        break;
      }
      case 'resign': {
        logger.warn(`User: ${user.username} is trying to resign`);
        break;
      }
    }
  });
});
