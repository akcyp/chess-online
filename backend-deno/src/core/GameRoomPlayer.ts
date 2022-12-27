import type { GameClientMessages } from '../validator/validator.ts';
import type { WSUser } from './WSUser.ts';

import { EventEmitter } from 'events';

type User = WSUser<GameClientMessages>;
type GameRoomPlayerEventMap = {
  notReconnected: [];
  timeLeft: [];
};

export class GameRoomPlayer extends EventEmitter<GameRoomPlayerEventMap> {
  #user: User;
  public getUser() {
    return this.#user;
  }
  public isUser(uuid: string) {
    return this.#user.uuid === uuid;
  }
  #reconnectTimeout = -1;
  #disconnected = false;
  get disconnected() {
    return this.#disconnected;
  }
  public reconnect(user: User) {
    this.#user = user;
    this.#disconnected = false;
    clearTimeout(this.#reconnectTimeout);
  }
  public disconnect() {
    this.#disconnected = true;
    this.#reconnectTimeout = setTimeout(() => {
      this.emit('notReconnected');
    }, 30 * 1e3);
  }
  public timeControlState = {
    timeLeft: 0,
    timerStartTs: 0,
  };
  constructor(user: User) {
    super();
    this.#user = user;
  }
  public getState() {
    return {
      nick: this.#user.username,
      online: !this.disconnected,
      timeLeft: this.timeControlState.timeLeft,
      timerStartTs: this.timeControlState.timerStartTs,
    };
  }
  #moveTimer = -1;
  public startTimer() {
    this.#moveTimer = setTimeout(() => {
      this.emit('timeLeft');
    }, this.timeControlState.timeLeft);
  }
  public stopTimer() {
    clearTimeout(this.#moveTimer);
  }
  readonly #internalState = {
    isReady: false,
    requestedNewGame: false,
    drawOffered: false,
  };
  public setReady(isReady: boolean) {
    this.#internalState.isReady = isReady;
  }
  public isReady() {
    return this.#internalState.isReady;
  }
  public toggleReady() {
    return this.setReady(!this.isReady());
  }
  public setNewGameRequest(wantReplay: boolean) {
    this.#internalState.requestedNewGame = wantReplay;
  }
  public isNewGameRequested() {
    return this.#internalState.requestedNewGame;
  }
  public toggleNewGameRequest() {
    return this.setNewGameRequest(!this.isNewGameRequested());
  }
  public setDrawOfferDecision(wantDraw: boolean) {
    this.#internalState.drawOffered = wantDraw;
  }
  public isDrawOffered() {
    return this.#internalState.drawOffered;
  }
  public toggleDrawOfferDecision() {
    this.setDrawOfferDecision(!this.isDrawOffered());
  }
  public reset(timeLeft: number) {
    clearTimeout(this.#moveTimer);
    this.#internalState.isReady = false;
    this.#internalState.requestedNewGame = false;
    this.#internalState.drawOffered = false;
    this.timeControlState.timeLeft = timeLeft;
    this.timeControlState.timerStartTs = Date.now();
  }
}
