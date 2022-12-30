import json
from typing import Dict

from marshmallow import ValidationError
from pyee import AsyncIOEventEmitter

from ws_core.ws_room import WS_Room
from ws_core.ws_user import WS_User
from core.game import GameRoom
from utils.roomid_generator import get_unique_room_id
from validators.create_game_action import CreateGameActionSchema


class LobbyRoom(WS_Room):
    def __init__(self):
        super().__init__('lobby')
        self.user_actions = AsyncIOEventEmitter()
        self.user_actions.on('createGame', self.on_create_game)

        self.eventEmitter.on('user_join', self.on_user_join)
        self.eventEmitter.on('user_leave', self.on_user_leave)
        self.eventEmitter.on('user_message', self.on_user_message)

        # Map of game_id to game room, type safe
        self.games: Dict[str, GameRoom] = {}

    async def on_user_join(self, user: WS_User):
        # await self.send(f"{user.username} joined the lobby")
        pass

    async def on_user_leave(self, user: WS_User):
        # await self.send(f"{user.username} left the lobby")
        pass

    async def on_user_message(self, user: WS_User, msg: str):
        try:
            data = json.loads(msg)
        except json.JSONDecodeError as e:
            await user.send_json({'error': 'Invalid JSON'})
            return

        if not isinstance(data, dict):
            await user.send_json({'error': 'Invalid JSON data'})
            return

        action_type = data.get('type')
        if action_type == 'createGame':
            schema = CreateGameActionSchema()
        else:
            await user.send_json({'error': 'Invalid action type'})
            return

        try:
            loaded_action = schema.load(data)
            self.user_actions.emit(action_type, user, loaded_action)
        except ValidationError as err:
            await user.send_json({'error': 'Invalid data'})

    async def on_create_game(self, user: WS_User, action: CreateGameActionSchema):
        # print debug info about action
        print(action)
        # Generate a random game id
        game_id = get_unique_room_id(list(self.games.keys()))
        # Create a new game room
        game_room = GameRoom(game_id)
        # Add room to list of games
        self.games[game_id] = game_room
        print(self.games)

    def get_room(self, room_id: str):
        if room_id in self.games:
            return self.games[room_id]
        else:
            return None
