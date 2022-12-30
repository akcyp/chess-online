import asyncio
import time
from typing import Union
from pyee.asyncio import AsyncIOEventEmitter
from ws_core.ws_user import WS_User


class GamePlayerState():
    def __init__(self):
        self.timeLeft = 0
        self.timerStartTs = 0
        self.isReady = False
        self.requestedNewGame = False
        self.offeredDraw = False

    def reset(self, timeLeft: int = 0):
        self.timeLeft = timeLeft
        self.timerStartTs = int(time.time() * 1000)
        self.isReady = False
        self.requestedNewGame = False
        self.offeredDraw = False


class GamePlayer():
    def __init__(self, user: WS_User):
        self.user = user
        self.eventEmitter = AsyncIOEventEmitter()
        self.is_disconnected = False
        self.internal_state = GamePlayerState()
        self.disconnect_timer: Union[asyncio.Task[None], None] = None
        self.move_timer: Union[asyncio.Task[None], None] = None

    def is_user(self, user: WS_User):
        return self.user.userUUID == user.userUUID

    async def disconnect_process(self):
        try:
            await asyncio.sleep(30)
            self.eventEmitter.emit('notReconnected')
        except asyncio.CancelledError:
            pass

    def disconnect(self):
        self.is_disconnected = True
        self.disconnect_timer = asyncio.create_task(self.disconnect_process())

    def reconnect(self, user: WS_User):
        if self.disconnect_timer is not None:
            self.disconnect_timer.cancel()
            self.disconnect_timer = None
        self.is_disconnected = False
        self.user = user

    def reset(self, timeLeft: int = 0):
        if self.disconnect_timer is not None:
            self.disconnect_timer.cancel()
            self.disconnect_timer = None

        if self.move_timer is not None:
            self.move_timer.cancel()
            self.move_timer = None

        self.internal_state.reset(timeLeft)

    def toggle_ready(self):
        self.internal_state.isReady = not self.internal_state.isReady

    def toggle_draw_offer(self):
        self.internal_state.offeredDraw = not self.internal_state.offeredDraw

    def toggle_new_game_request(self):
        self.internal_state.requestedNewGame = not self.internal_state.requestedNewGame

    async def timer_process(self):
        try:
            await asyncio.sleep(self.internal_state.timeLeft / 1000)
            self.eventEmitter.emit('timeOut')
        except asyncio.CancelledError:
            pass

    def start_timer(self):
        # Create cancelable timer
        self.move_timer = asyncio.create_task(self.timer_process())

    def stop_timer(self):
        if self.move_timer is not None:
            self.move_timer.cancel()
            self.move_timer = None

    def get_state(self):
        return {
            'nick': self.user.username,
            'online': not self.is_disconnected,
            'timeLeft': self.internal_state.timeLeft,
            'timerStartTs': self.internal_state.timerStartTs,
        }
