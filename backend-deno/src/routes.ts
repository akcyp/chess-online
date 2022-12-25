import type { AppState } from './server.ts';
import { isHttpError, Router, Status } from 'oak';

import { logger } from './logger.ts';
import { LobbyManager } from './core/LobbyManager.ts';
import { generateUsername } from './utils/generateUsername.ts';
import {
  gamePayloadValidator,
  lobbyPayloadValidator,
} from './validator/validator.ts';
import { User } from './core/User.ts';

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
  const ws = ctx.upgrade();
  const user = new User({
    uuid: ctx.state.session.get('userUUID') as string,
    username: ctx.state.session.get('username') as string,
    ws,
  });
  ws.addEventListener('open', () => {
    logger.info(`User ${user.uuid} connected to lobby`);
    lobbyManager.addUser(user);
  });
  ws.addEventListener('close', () => {
    logger.info(`User ${user.uuid} disconnected from lobby`);
    lobbyManager.deleteUser(user);
  });
  ws.addEventListener('message', async (e) => {
    logger.info(`User ${user.uuid} sent message to lobby: ${e.data}`);
    const validationResult = await lobbyPayloadValidator(e.data);
    if (validationResult instanceof Error) {
      user.send({ error: validationResult.message });
      return;
    }
    const { type, instance } = validationResult;
    switch (type) {
      case 'createGame': {
        logger.warn(
          `User: ${user.uuid} is creating game with following config`,
          instance,
        );
        lobbyManager.createGame(user, instance);
        break;
      }
    }
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
  const ws = ctx.upgrade();
  const user = new User({
    uuid: ctx.state.session.get('userUUID') as string,
    username: ctx.state.session.get('username') as string,
    ws,
  });
  ws.addEventListener('open', () => {
    logger.info(`User ${user.uuid} connected`);
    room.addUser(user);
  });
  ws.addEventListener('close', () => {
    logger.info(`User ${user.uuid} disconnected`);
    room.deleteUser(user);
  });
  ws.addEventListener('message', async (e) => {
    logger.info(`User ${user.uuid} sent message: ${e.data}`);
    const validationResult = await gamePayloadValidator(e.data);
    if (validationResult instanceof Error) {
      user.send({ error: validationResult.message });
      return;
    }
    const { type, instance } = validationResult;
    switch (type) {
      case 'play': {
        logger.warn(
          `User: ${user.uuid} is trying to play as ${instance.color}`,
        );
        const updated = room.playAs(user, instance.color);
        if (updated) {
          lobbyManager.updateGames();
        }
        break;
      }
      case 'ready': {
        logger.warn(
          `User: ${user.uuid} is saying that is ${
            instance.ready ? 'ready' : 'not ready'
          }`,
        );
        room.setReady(user, instance.ready);
        break;
      }
      case 'move': {
        logger.warn(
          `User: ${user.uuid} is trying to move from ${instance.from} to ${instance.to} ${
            instance.promotion ? `with promotion ${instance.promotion}` : ''
          }`,
        );
        break;
      }
      case 'offerdraw': {
        logger.warn(`User: ${user.uuid} is trying to offer draw`);
        break;
      }
      case 'rematch': {
        logger.warn(`User: ${user.uuid} is trying to rematch`);
        break;
      }
      case 'resign': {
        logger.warn(`User: ${user.uuid} is trying to resign`);
        break;
      }
    }
  });
});
