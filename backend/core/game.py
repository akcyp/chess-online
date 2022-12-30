import json

from marshmallow import ValidationError
from pyee import AsyncIOEventEmitter

from ws_core.ws_room import WS_Room
from ws_core.ws_user import WS_User

from validators.game_move_action import GameMoveActionSchema
from validators.game_offer_draw_action import GameOfferDrawActionSchema
from validators.game_play_action import GamePlayActionSchema
from validators.game_ready_action import GameReadyActionSchema
from validators.game_rematch_action import GameRematchActionSchema
from validators.game_resign_action import GameResignActionSchema


class GameRoom(WS_Room):
    def __init__(self, room_id: str):
        super().__init__(room_id)
        self.user_actions = AsyncIOEventEmitter()
        self.user_actions.on('move', self.on_move_action)
        self.user_actions.on('offerDraw', self.on_offer_draw_action)
        self.user_actions.on('play', self.on_play_action)
        self.user_actions.on('ready', self.on_ready_action)
        self.user_actions.on('rematch', self.on_rematch_action)
        self.user_actions.on('resign', self.on_resign_action)

        self.eventEmitter.on('user_join', self.on_user_join)
        self.eventEmitter.on('user_leave', self.on_user_leave)
        self.eventEmitter.on('user_message', self.on_user_message)

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
            await user.send_json({'error': 'Invalid action type'})
            return

        try:
            loaded_action = schema.load(data)
            self.user_actions.emit(action_type, user, loaded_action)
        except ValidationError as err:
            await user.send_json({'error': 'Invalid data'})

    async def on_move_action(self, user: WS_User, action: GameMoveActionSchema):
        # print debug info about action
        print(action)

    async def on_offer_draw_action(self, user: WS_User, action: GameOfferDrawActionSchema):
        # print debug info about action
        print(action)

    async def on_play_action(self, user: WS_User, action: GamePlayActionSchema):
        # print debug info about action
        print(action)

    async def on_ready_action(self, user: WS_User, action: GameReadyActionSchema):
        # print debug info about action
        print(action)

    async def on_rematch_action(self, user: WS_User, action: GameRematchActionSchema):
        # print debug info about action
        print(action)

    async def on_resign_action(self, user: WS_User, action: GameResignActionSchema):
        # print debug info about action
        print(action)
