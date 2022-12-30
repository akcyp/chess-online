import asyncio
import chess
import copy
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


class GameState:
    def __init__(self):
        self.game_started = False
        self.is_draw = False
        self.is_game_over = False
        self.engine = chess.Board()


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

        self.internal_game_state = GameState()

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

        await user.send(self.get_full_game_state_for_user(user, self.get_full_game_state()))

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
            'player1': self.players.get('white').user.username if self.players.get('white') is not None else '---',
            'player2': self.players.get('black').user.username if self.players.get('black') is not None else '---',
            'time': {
                'minutes': self.minutes,
                'increment': self.increment,
            },
        }

    def get_game_state(self):
        engine_result = self.internal_game_state.engine.result()
        if self.internal_game_state.is_draw:
            winner = 'draw'
        elif engine_result == '0-1':
            winner = 'black'
        elif engine_result == '1-0':
            winner = 'white'
        else:
            winner = None
        return {
            'fen': self.internal_game_state.engine.fen(),
            'gameStarted': self.internal_game_state.game_started,
            'gameOver': self.internal_game_state.is_game_over,
            'turn': 'black' if self.internal_game_state.engine.turn == chess.BLACK else 'white',
            'winner': winner,
        }

    def get_full_game_state(self):
        game_state = self.get_game_state()

        is_white_ready = self.players.get(
            'white') is not None and self.players.get('white').is_ready
        is_black_ready = self.players.get(
            'black') is not None and self.players.get('black').is_ready

        white_offered_draw = self.players.get(
            'white') is not None and self.players.get('white').offered_draw
        black_offered_draw = self.players.get(
            'black') is not None and self.players.get('black').offered_draw

        white_requested_new_game = self.players.get(
            'white') is None or self.players.get('white').requested_new_game
        black_requested_new_game = self.players.get(
            'black') is None or self.players.get('black').requested_new_game

        return {
            'type': 'updateGameState',
            'players': {
                'white': {**self.players.get('white').get_state(), 'isYou': False} if self.players.get('white') is not None else None,
                'black': {**self.players.get('black').get_state(), 'isYou': False} if self.players.get('black') is not None else None,
            },
            'game': {
                'timeControl': {
                    'minutes': self.minutes,
                    'increment': self.increment,
                },
                'readyToPlay': is_white_ready or is_black_ready,
                'rematchOffered': white_requested_new_game or black_requested_new_game,
                'drawOffered': white_offered_draw or black_offered_draw,
                **game_state
            },
        }

    def get_full_game_state_for_user(self, user: WS_User, state: dict):
        game_state = copy.deepcopy(state)
        if self.players.get('white') is not None and self.players.get('white').user.userUUID == user.userUUID:
            game_state['players']['white']['isYou'] = True
        if self.players.get('black') is not None and self.players.get('black').user.userUUID == user.userUUID:
            game_state['players']['black']['isYou'] = True
        return game_state

    async def send_game_state(self, broadcast_user: Union[WS_User, None] = None):
        state = self.get_full_game_state()
        self.iterate_users(lambda user: user.send(
            state) if user != broadcast_user else None)

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
