import json
from typing import Dict, Union

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

        self.games: Dict[str, GameRoom] = {}

    async def on_user_join(self, user: WS_User):
        await self.send_players_state()
        await self.send_games_state(user)
        pass

    async def on_user_leave(self, user: WS_User):
        await self.send_players_state()
        pass

    async def send_games_state(self, user: Union[WS_User, None] = None):
        previews = list(map(lambda room: room.get_preview(),
                        list(self.games.values())))
        state = {
            'type': 'updateGames',
            'games': previews,
        }
        if user is not None:
            await user.send(state)
        else:
            await self.send(state)

    async def send_players_state(self):
        await self.send({
            'type': 'updatePlayers',
            'count': len(self.users)
        })

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
        if action_type == 'createGame':
            schema = CreateGameActionSchema()
        else:
            await user.send({'error': 'Invalid action type'})
            return

        try:
            loaded_action = schema.load(data)
            self.user_actions.emit(action_type, user, loaded_action)
        except ValidationError as err:
            await user.send({'error': 'Invalid data'})

    async def on_create_game(self, user: WS_User, action: dict):
        print(action)
        game_id = get_unique_room_id(list(self.games.keys()))
        game_room = GameRoom(
            game_id,
            private=action.get('private'),
            minutes=action.get('minutes'),
            increment=action.get('increment'),
        )
        game_room.eventEmitter.on(
            'destroy', lambda: self.on_game_destroy(game_id))
        game_room.eventEmitter.on(
            'previewUpdate', lambda: self.on_game_update(game_id))

        self.games[game_id] = game_room

        if not action.get('private'):
            await self.send_games_state()

        await user.send({'type': 'gameCreated', 'id': game_id})

    async def on_game_destroy(self, game_id: str):
        self.games.pop(game_id)
        print(f'Game {game_id} destroyed')
        await self.send_games_state()

    async def on_game_update(self, game_id: str):
        game = self.games[game_id]
        if not game.private:
            await self.send_games_state()

    def get_room(self, room_id: str):
        if room_id in self.games:
            return self.games[room_id]
        else:
            return None
