import type { User } from './User.ts';

export class GameRoomPlayer {
  #user: User;
  #timeLeft = 10 * 1e3;
  #lastTurn = new Date();
  constructor(user: User) {
    this.#user = user;
  }
  #disconnected = false;
  get disconnected() {
    return this.#disconnected;
  }
  reconnect(user: User) {
    this.#user = user;
    this.#disconnected = false;
  }
  disconnect() {
    this.#disconnected = true;
  }
  getState(payloadRequester?: User) {
    return {
      nick: this.#user.username,
      online: !this.disconnected,
      timeLeft: this.#timeLeft,
      lastTurnTs: this.#lastTurn.getTime(),
      isYou: payloadRequester === this.#user,
    };
  }
  isUser(uuid: string) {
    return this.#user.uuid === uuid;
  }
  #readyStatus = false;
  setReady(ready: boolean) {
    this.#readyStatus = ready;
  }
  isReady() {
    return this.#readyStatus;
  }
}
