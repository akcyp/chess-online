import type { GameClientMessages } from '../validator/validator.ts';
import type { WSUser } from './WSUser.ts';

type User = WSUser<GameClientMessages>;
export class GameRoomPlayer {
  #user: User;
  public getUser() {
    return this.#user;
  }
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
    timerStartTs: 0,
  };
  constructor(user: User) {
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
    this.#internalState.isReady = false;
    this.#internalState.requestedNewGame = false;
    this.#internalState.drawOffered = false;
    this.timeControlState.timeLeft = timeLeft;
    this.timeControlState.timerStartTs = Date.now();
  }
}
