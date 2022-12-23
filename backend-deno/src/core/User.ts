import type { WSServerMessage } from '../types/WSServerMessage.ts';

export class User {
  #uuid: string;
  #username: string;
  #ws: WebSocket;
  constructor(config: {
    uuid: string;
    username: string;
    ws: WebSocket;
  }) {
    this.#uuid = config.uuid;
    this.#username = config.username;
    this.#ws = config.ws;
  }
  get uuid() {
    return this.#uuid;
  }
  get username() {
    return this.#username;
  }
  send(message: WSServerMessage) {
    this.#ws.send(JSON.stringify(message));
  }
}
