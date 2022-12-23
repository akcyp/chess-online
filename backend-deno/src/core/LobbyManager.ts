import type { WSServerMessage } from '../types/WSServerMessage.ts';
import type { User } from './User.ts';
import { GameRoom } from './GameRoom.ts';
import { getUniqueString } from '../utils/random.ts';

export class LobbyManager {
  #users = new Set<User>();
  getUserCount() {
    return this.#users.size;
  }
  broadcast(except: User, message: WSServerMessage) {
    this.#users.forEach((user) => {
      if (except !== user) {
        user.send(message);
      }
    });
  }
  emit(message: WSServerMessage) {
    this.#users.forEach((user) => {
      user.send(message);
    });
  }
  addUser(user: User) {
    this.#users.add(user);
    this.emit({
      type: 'updatePlayers',
      count: this.getUserCount(),
    });
    user.send({
      type: 'updateGames',
      games: this.getGamesInfo(),
    });
  }
  deleteUser(user: User) {
    this.#users.delete(user);
    this.emit({
      type: 'updatePlayers',
      count: this.getUserCount(),
    });
  }
  #games = new Map<string, GameRoom>();
  getGameRoom(id: string) {
    return this.#games.get(id) ?? null;
  }
  getGamesInfo() {
    return [...this.#games.values()]
      .filter((game) => !game.isPrivate())
      .map((game) => game.getPreview());
  }
  createGame(
    user: User,
    config: { minutes: number; increment: number; private: boolean },
  ) {
    const id = getUniqueString([...this.#games.keys()]);
    const room = new GameRoom({
      id,
      minutesPerSide: config.minutes,
      incrementTime: config.increment,
      private: config.private,
    });
    this.#games.set(id, room);
    if (!room.isPrivate()) {
      this.emit({
        type: 'updateGames',
        games: this.getGamesInfo(),
      });
    }
    user.send({
      type: 'gameCreated',
      id,
    });
  }
}
