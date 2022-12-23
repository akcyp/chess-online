import { ChessGame } from 'chess';
import { User } from './User.ts';

export type GameRoomState = {
  players: {
    white: null;
    black: null;
  };
};

export type GameRoomConfig = {
  id: string;
  private: boolean;
  minutesPerSide: number;
  incrementTime: number;
};

export class GameRoom {
  #config: GameRoomConfig;
  #players = {
    white: null as null | User,
    black: null as null | User,
  };
  constructor(config: GameRoomConfig) {
    this.#config = config;
  }
  #engine = ChessGame.NewStandardGame();
  isPrivate() {
    return this.#config.private;
  }
  getState(): GameRoomState {
    return {
      players: {
        white: null,
        black: null,
      },
    };
  }
  getPreview() {
    return {
      id: this.#config.id,
      player1: this.#players.white?.username || '---',
      player2: this.#players.black?.username || '---',
      time: [this.#config.minutesPerSide, this.#config.incrementTime],
    };
  }
  #users = new Set<User>();
  addUser(user: User) {
    this.#users.add(user);
  }
  deleteUser(user: User) {
    this.#users.delete(user);
  }
}
