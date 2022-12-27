import type { WSServerLobbyMessage } from '../types/WSServerMessage.ts';
import type { WSUser } from './WSUser.ts';
import type { LobbyClientMessages } from '../validator/validator.ts';

import { BasicRoomEventMap, WSRoom } from './WSRoom.ts';
import { GameRoom } from './GameRoom.ts';
import { getUniqueString } from '../utils/random.ts';

type User = WSUser<LobbyClientMessages>;

// deno-lint-ignore ban-types
type LobbyEventMap = BasicRoomEventMap<User> & {};

export class LobbyManager
  extends WSRoom<User, WSServerLobbyMessage, LobbyEventMap> {
  constructor() {
    super();
    this.on('connect:after', (user) => {
      user.send({
        type: 'updateGames',
        games: this.getGamesInfo(),
      });
      user.on('message:parse:failed', (e) => {
        user.send({ error: e.message });
      }).on('message:parse:success', (data) => {
        console.log(data, 'dispatcher');
        switch (data.type) {
          case 'createGame': {
            this.createGame(user, data.instance);
            break;
          }
        }
      });
      this.emitUpdate.updatePlayers();
    }).on('disconnect:after', () => {
      this.emitUpdate.updatePlayers();
    });
  }
  readonly emitUpdate = {
    updateGames: () => {
      this.send({
        type: 'updateGames',
        games: this.getGamesInfo(),
      });
    },
    updatePlayers: () => {
      this.send({
        type: 'updatePlayers',
        count: this.getUsersCount(),
      });
    },
  };

  readonly #games = new Map<string, GameRoom>();
  public getGameRoom(id: string) {
    return this.#games.get(id) ?? null;
  }
  private getGamesInfo() {
    return [...this.#games.values()].filter((game) => !game.isPrivate()).map((
      game,
    ) => game.getPreview());
  }
  private createGame(
    user: User,
    config: { minutes: number; increment: number; private: boolean },
  ) {
    console.log('creategame tttt');
    const id = getUniqueString([...this.#games.keys()]);
    const room = new GameRoom({
      id,
      minutesPerSide: config.minutes,
      incrementTime: config.increment,
      private: config.private,
    });
    room.on('previewUpdated', () => {
      this.emitUpdate.updateGames();
    });
    this.#games.set(id, room);
    if (!room.isPrivate()) {
      this.emitUpdate.updateGames();
    }
    user.send({
      type: 'gameCreated',
      id,
    });
  }
}
