import type { WSServerMessage } from '../types/WSServerMessage.ts';

import { EventEmitter } from 'events';

export type WSUserEventMap<T> = {
  connection: [];
  disconnect: [];
  message: [data: unknown];
  'message:parse:success': [data: Exclude<T, Error>];
  'message:parse:failed': [error: Error];
};

export class WSUser<T = never> extends EventEmitter<WSUserEventMap<T>> {
  readonly #uuid: string;
  readonly #username: string;
  readonly #ws: WebSocket;
  constructor(config: {
    uuid: string;
    username: string;
    ws: WebSocket;
    parseData?: (data: unknown) => Promise<T>;
  }) {
    super();
    this.#uuid = config.uuid;
    this.#username = config.username;
    this.#ws = config.ws;
    this.#ws.addEventListener('open', async () => {
      await this.emit('connection');
    });
    this.#ws.addEventListener('close', async () => {
      await this.emit('disconnect');
    });
    this.#ws.addEventListener('message', async (e) => {
      await this.emit('message', e.data);
      if (config.parseData) {
        const result = await config.parseData(e.data);
        if (result instanceof Error) {
          await this.emit('message:parse:failed', result);
        } else {
          await this.emit('message:parse:success', result as Exclude<T, Error>);
        }
      }
    });
  }
  get uuid() {
    return this.#uuid;
  }
  get username() {
    return this.#username;
  }
  public send(message: WSServerMessage) {
    this.#ws.send(JSON.stringify(message));
  }
}
