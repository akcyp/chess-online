import type { WSServerMessage } from '../types/WSServerMessage.ts';

import { EventEmitter } from 'events';
import { WSUser } from './WSUser.ts';

export type BasicRoomEventMap<User> = {
  'connect:before': [user: User];
  'connect:after': [user: User];
  'disconnect:before': [user: User];
  'disconnect:after': [user: User];
};

export class WSRoom<
  // deno-lint-ignore no-explicit-any
  User extends WSUser<any>,
  Message extends WSServerMessage = WSServerMessage,
  EventMap extends BasicRoomEventMap<User> = BasicRoomEventMap<User>,
> extends EventEmitter<EventMap> {
  readonly #users = new Set<User>();
  public getUsersCount() {
    return this.#users.size;
  }
  public async iterateOverUsers(
    callback: (user: User) => Promise<void> | void,
  ) {
    for (const user of this.#users) {
      await callback(user);
    }
  }
  public broadcast(except: User, message: Message) {
    this.iterateOverUsers((user) => {
      if (except !== user) {
        user.send(message);
      }
    });
  }
  public send(message: Message) {
    this.iterateOverUsers((user) => user.send(message));
  }
  public async addUser(user: User) {
    await this.emit('connect:before', user);
    this.#users.add(user);
    await this.emit('connect:after', user);
    user.on('disconnect', () => {
      this.emit('disconnect:before', user);
      this.#users.delete(user);
      this.emit('disconnect:after', user);
    });
  }
}
