import asyncio
import json
from typing import Dict, Union

from marshmallow import ValidationError
from pyee import AsyncIOEventEmitter
from core.game_player import GamePlayer

from ws_core.ws_room import WS_Room
from ws_core.ws_user import WS_User

from validators.game_move_action import GameMoveActionSchema
from validators.game_offer_draw_action import GameOfferDrawActionSchema
from validators.game_play_action import GamePlayActionSchema
from validators.game_ready_action import GameReadyActionSchema
from validators.game_rematch_action import GameRematchActionSchema
from validators.game_resign_action import GameResignActionSchema


class GameRoom(WS_Room):
    def __init__(self, room_id: str, private: bool = False, minutes: int = 5, increment: int = 0):
        super().__init__(room_id)
        self.private = private
        self.minutes = minutes
        self.increment = increment

        self.players: Dict[str, Union[None, GamePlayer]] = {
            'white': None,
            'black': None,
        }

        self.user_actions = AsyncIOEventEmitter()
        self.user_actions.on('move', self.on_move_action)
        self.user_actions.on('offerDraw', self.on_offer_draw_action)
        self.user_actions.on('play', self.on_play_action)
        self.user_actions.on('ready', self.on_ready_action)
        self.user_actions.on('rematch', self.on_rematch_action)
        self.user_actions.on('resign', self.on_resign_action)

        self.destory_timer: Union[asyncio.Task[None], None] = None
        self.start_destroy_timer()

        self.eventEmitter.on('user_join', self.on_user_join)
        self.eventEmitter.on('user_leave', self.on_user_leave)
        self.eventEmitter.on('user_message', self.on_user_message)

    async def destroy_process(self):
        try:
            await asyncio.sleep(45)
            self.eventEmitter.emit('destroy')
        except asyncio.CancelledError:
            pass

    def start_destroy_timer(self):
        if self.destory_timer is None:
            print(f'Room {self.room_id} destory timer started')
            self.destory_timer = asyncio.create_task(self.destroy_process())

    def stop_destroy_timer(self):
        print(f'Room {self.room_id} destory timer stopped')
        if self.destory_timer is not None:
            self.destory_timer.cancel()
            self.destory_timer = None

    async def on_user_join(self, user: WS_User):
        if self.destory_timer is not None:
            self.stop_destroy_timer()

        if self.players.get('white') is not None and self.player.get('white').user.userUUID == user.userUUID:
            self.player.get('white').reconnect(user)
            self.send_game_state(broadcast_user=user)

        if self.players.get('black') is not None and self.player.get('black').user.userUUID == user.userUUID:
            self.player.get('black').reconnect(user)
            self.send_game_state(broadcast_user=user)

    async def on_user_leave(self, user: WS_User):
        if self.players.get('white') is not None and self.player.get('white').user.userUUID == user.userUUID:
            self.player.get('white').disconnect()
            self.send_game_state(broadcast_user=user)

        if self.players.get('black') is not None and self.player.get('black').user.userUUID == user.userUUID:
            self.player.get('black').disconnect()
            self.send_game_state(broadcast_user=user)

        if len(self.users) == 0:
            self.start_destroy_timer()

    def get_preview(self):
        return {
            'id': self.room_id,
            'player1': self.player_white.user.username if self.player_white is not None else '---',
            'player2': self.player_black.user.username if self.player_black is not None else '---',
            'time': {
                'minutes': self.minutes,
                'increment': self.increment,
            },
        }

    async def send_game_state(self, broadcast_user: Union[WS_User, None] = None):
        state = {}
        if broadcast_user is not None:
            await self.broadcast(broadcast_user, state)
        else:
            await self.send(state)
        pass

    async def on_user_message(self, user: WS_User, msg: str):
        try:
            data = json.loads(msg)
        except json.JSONDecodeError as e:
            await user.send({'error': 'Invalid JSON'})
            return

        if not isinstance(data, dict):
            await user.send({'error': 'Invalid JSON data'})
            return

        action_type = data.get('type')
        if action_type == 'move':
            schema = GameMoveActionSchema()
        elif action_type == 'offerDraw':
            schema = GameOfferDrawActionSchema()
        elif action_type == 'play':
            schema = GamePlayActionSchema()
        elif action_type == 'ready':
            schema = GameReadyActionSchema()
        elif action_type == 'rematch':
            schema = GameRematchActionSchema()
        elif action_type == 'resign':
            schema = GameResignActionSchema()
        else:
            await user.send({'error': 'Invalid action type'})
            return

        try:
            loaded_action = schema.load(data)
            self.user_actions.emit(action_type, user, loaded_action)
        except ValidationError as err:
            await user.send({'error': 'Invalid data'})

    def get_player_color(self, user: WS_User):
        if self.player.get('white') is not None and self.player.get('white').user.userUUID == user.userUUID:
            return 'white'
        elif self.player.get('black') is not None and self.player.get('black').user.userUUID == user.userUUID:
            return 'black'
        else:
            return None

    async def on_move_action(self, user: WS_User, action: dict):
        # print debug info about action
        print(action)

    async def on_offer_draw_action(self, user: WS_User, action: dict):
        # print debug info about action
        print(action)

    async def on_play_action(self, user: WS_User, action: dict):
        # print debug info about action
        print(action)

    async def on_ready_action(self, user: WS_User, action: dict):
        # print debug info about action
        print(action)

    async def on_rematch_action(self, user: WS_User, action: dict):
        # print debug info about action
        print(action)

    async def on_resign_action(self, user: WS_User, action: dict):
        # print debug info about action
        print(action)
