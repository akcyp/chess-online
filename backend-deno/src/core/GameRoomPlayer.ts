import type { GameClientMessages } from '../validator/validator.ts';
import type { WSUser } from './WSUser.ts';

type User = WSUser<GameClientMessages>;
export class GameRoomPlayer {
  #user: User;
  public isUser(uuid: string) {
    return this.#user.uuid === uuid;
  }
  #disconnected = false;
  get disconnected() {
    return this.#disconnected;
  }
  public reconnect(user: User) {
    this.#user = user;
    this.#disconnected = false;
  }
  public disconnect() {
    this.#disconnected = true;
  }
  public timeControlState = {
    timeLeft: 0,
    lastTurn: new Date(),
  };
  constructor(user: User) {
    this.#user = user;
  }
  public getState() {
    return {
      nick: this.#user.username,
      online: !this.disconnected,
      timeLeft: this.timeControlState.timeLeft,
      lastTurnTs: this.timeControlState.lastTurn.getTime(),
    };
  }
  readonly #internalState = {
    isReady: false,
  };
  public setReady(isReady: boolean) {
    this.#internalState.isReady = isReady;
  }
  public isReady() {
    return this.#internalState.isReady;
  }
}
