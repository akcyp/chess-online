from pyee.asyncio import AsyncIOEventEmitter

from ws_core.ws_user import WS_User


class WS_Room:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.users = set()
        self.eventEmitter = AsyncIOEventEmitter()

    def add_user(self, user: WS_User):
        self.users.add(user)
        self.eventEmitter.emit('user_join', user)

    def remove_user(self, user: WS_User):
        self.users.remove(user)
        self.eventEmitter.emit('user_leave', user)

    def on_message(self, user: WS_User, msg: str):
        self.eventEmitter.emit('user_message', user, msg)

    async def send(self, msg: str):
        for user in self.users:
            await user.send(msg)

    async def broadcast(self, user: WS_User, msg: str):
        for u in self.users:
            if u != user:
                await u.send(msg)

    async def iterate_users(self, func):
        for user in self.users:
            await func(user)

    def __repr__(self):
        return f"WS_Room({self.room_id}, {self.users})"
