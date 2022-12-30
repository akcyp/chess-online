import asyncio
import time
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
        self.is_game_over = False
        self.winner = None
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
        self.user_actions.on('offerdraw', self.on_offer_draw_action)
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

        if self.players.get('white') is not None and self.players.get('white').is_user(user):
            self.players.get('white').reconnect(user)
            await self.broadcast_game_state(broadcast_user=user)

        if self.players.get('black') is not None and self.players.get('black').is_user(user):
            self.players.get('black').reconnect(user)
            await self.broadcast_game_state(broadcast_user=user)

        await user.send(self.get_full_game_state_for_user(user, self.get_full_game_state()))

    async def on_user_leave(self, user: WS_User):
        if self.players.get('white') is not None and self.players.get('white').is_user(user):
            self.players.get('white').disconnect()
            await self.broadcast_game_state(broadcast_user=user)

        if self.players.get('black') is not None and self.players.get('black').is_user(user):
            self.players.get('black').disconnect()
            await self.broadcast_game_state(broadcast_user=user)

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
        if self.internal_game_state.winner:
            winner = self.internal_game_state.winner
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
            'white') is not None and self.players.get('white').internal_state.isReady
        is_black_ready = self.players.get(
            'black') is not None and self.players.get('black').internal_state.isReady

        white_offered_draw = self.players.get(
            'white') is not None and self.players.get('white').internal_state.offeredDraw
        black_offered_draw = self.players.get(
            'black') is not None and self.players.get('black').internal_state.offeredDraw

        white_requested_new_game = self.players.get(
            'white') is None or self.players.get('white').internal_state.requestedNewGame
        black_requested_new_game = self.players.get(
            'black') is None or self.players.get('black').internal_state.requestedNewGame

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
        if self.players.get('white') is not None and self.players.get('white').is_user(user):
            game_state['players']['white']['isYou'] = True
        if self.players.get('black') is not None and self.players.get('black').is_user(user):
            game_state['players']['black']['isYou'] = True
        return game_state

    async def broadcast_game_state(self, broadcast_user: Union[WS_User, None] = None):
        state = self.get_full_game_state()
        for user in self.users:
            if user != broadcast_user:
                await user.send(self.get_full_game_state_for_user(user, state))

    async def send_game_state(self):
        state = self.get_full_game_state()
        for user in self.users:
            await user.send(self.get_full_game_state_for_user(user, state))

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
        elif action_type == 'offerdraw':
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
        if self.players.get('white') is not None and self.players.get('white').is_user(user):
            return 'white'
        elif self.players.get('black') is not None and self.players.get('black').is_user(user):
            return 'black'
        else:
            return None

    def reset_game(self):
        self.internal_game_state.game_started = False
        self.internal_game_state.is_game_over = False
        self.internal_game_state.winner = None
        self.internal_game_state.engine.reset()

        if self.players.get('white') is not None:
            self.players.get('white').reset(self.minutes * 60 * 1000)

        if self.players.get('black') is not None:
            self.players.get('black').reset(self.minutes * 60 * 1000)

    def update_player_time(self, color: str, diff: int):
        if self.players.get(color) is not None:
            player = self.players.get(color)
            player.internal_state.timeLeft -= diff
            player.internal_state.timerStartTs = int(time.time() * 1000)

    def recalc_player_time(self, color: str, use_increment: bool = True):
        if self.players.get(color) is not None:
            player = self.players.get(color)
            diff = int(time.time() * 1000) - player.internal_state.timerStartTs
            if use_increment:
                diff -= self.increment * 1000
            self.update_player_time(color, diff)

    async def player_not_reconnected(self, user: WS_User):
        color = self.get_player_color(user)
        if color is None:
            return

        if self.internal_game_state.game_started and not self.internal_game_state.is_game_over:
            opposite_color = 'white' if color == 'black' else 'black'
            self.internal_game_state.winner = opposite_color
            self.internal_game_state.is_game_over = True

        self.players[color] = None

        await self.send_game_state()
        self.eventEmitter.emit('previewUpdate')

    async def player_time_out(self, user: WS_User):
        color = self.get_player_color(user)
        if color is None:
            return

        opposite_color = 'white' if color == 'black' else 'black'
        self.internal_game_state.winner = opposite_color
        self.internal_game_state.is_game_over = True

        await self.send_game_state()

    async def on_play_action(self, user: WS_User, action: dict):
        color = action.get('color')  # can be white | black | exit
        game_state = self.get_game_state()
        if color == 'exit':
            if self.internal_game_state.game_started and not self.internal_game_state.is_game_over:
                await user.send({'error': 'Game has already started'})
                return

            user_color = self.get_player_color(user)
            if user_color is None:
                await user.send({'error': 'You are not a player in this game'})
                return

            self.players[user_color] = None
            if self.internal_game_state.is_game_over and self.players.get('white') is None and self.players.get('black') is None:
                self.reset_game()

            await self.send_game_state()
            self.eventEmitter.emit('previewUpdate')
            return

        if self.internal_game_state.game_started or self.internal_game_state.is_game_over:
            await user.send({'error': 'Game has already started'})
            return

        opposite_color = 'black' if color == 'white' else 'white'

        if self.players[color] is None and (self.players[opposite_color] is None or not self.players[opposite_color].is_user(user)):
            player = GamePlayer(user)
            player.internal_state.timeLeft = self.minutes * 60 * 1000
            player.eventEmitter.on(
                'notReconnected', lambda: self.player_not_reconnected(user))
            player.eventEmitter.on(
                'timeOut', lambda: self.player_time_out(user))
            self.players[color] = player
            self.eventEmitter.emit('previewUpdate')
            await self.send_game_state()

    async def on_ready_action(self, user: WS_User, action: dict):
        color = self.get_player_color(user)
        if color is None:
            await user.send({'error': 'You are not a player in this game'})
            return

        player = self.players[color]
        player.toggle_ready()

        if self.players.get('white') is not None and self.players.get('black') is not None and self.players.get('white').internal_state.isReady and self.players.get('black').internal_state.isReady:
            self.internal_game_state.game_started = True
            self.update_player_time('white', 0)
            self.update_player_time('black', 0)
            self.players.get('white').start_timer()

        await self.send_game_state()

    async def on_move_action(self, user: WS_User, action: dict):
        color = self.get_player_color(user)
        if color is None:
            await user.send({'error': 'You are not a player in this game'})
            return

        if not self.internal_game_state.game_started or self.internal_game_state.is_game_over:
            await user.send({'error': 'Game has not started'})
            return

        game_state = self.get_game_state()
        if game_state.get('turn') != color:
            await user.send({'error': 'Not your turn'})
            return

        uci_move: str = (action.get('from_') + action.get('to')).lower()
        if action.get('promotion'):
            uci_move += action.get('promotion').lower()

        try:
            move = chess.Move.from_uci(uci_move)
        except:
            await user.send({'error': 'Illegal move notation'})
            return

        if not self.internal_game_state.engine.is_legal(move):
            await user.send({'error': 'Illegal move'})
            return

        self.internal_game_state.engine.push(move)
        if self.internal_game_state.engine.is_game_over():
            self.internal_game_state.is_game_over = True
            result = self.internal_game_state.engine.result()
            if result == '1-0':
                winner = 'white'
            elif result == '0-1':
                winner = 'black'
            else:
                winner = 'draw'
            self.internal_game_state.winner = winner

        opposite_color = 'white' if color == 'black' else 'black'
        self.recalc_player_time(color, True)
        self.update_player_time(opposite_color, 0)
        self.players.get(color).stop_timer()
        if not self.internal_game_state.is_game_over:
            self.players.get(opposite_color).start_timer()

        await self.send_game_state()

    async def on_resign_action(self, user: WS_User, action: dict):
        color = self.get_player_color(user)
        if color is None:
            await user.send({'error': 'You are not a player in this game'})
            return

        if not self.internal_game_state.game_started or self.internal_game_state.is_game_over:
            await user.send({'error': 'Game has not started'})
            return

        game_state = self.get_game_state()
        self.recalc_player_time(game_state.get('turn'), False)
        self.update_player_time('white' if game_state.get(
            'turn') == 'black' else 'black', 0)

        self.players.get('white').stop_timer()
        self.players.get('black').stop_timer()

        opposite_color = 'white' if color == 'black' else 'black'
        self.internal_game_state.winner = opposite_color
        self.internal_game_state.is_game_over = True

        await self.send_game_state()

    async def on_offer_draw_action(self, user: WS_User, action: dict):
        color = self.get_player_color(user)
        if color is None:
            await user.send({'error': 'You are not a player in this game'})
            return

        if not self.internal_game_state.game_started or self.internal_game_state.is_game_over:
            await user.send({'error': 'Game has not started'})
            return

        self.players[color].toggle_draw_offer()

        white_decision = self.players.get(
            'white').internal_state.offeredDraw or False
        black_decision = self.players.get(
            'black').internal_state.offeredDraw or False

        if white_decision and black_decision:
            game_state = self.get_game_state()
            self.internal_game_state.winner = 'draw'
            self.internal_game_state.is_game_over = True

            self.recalc_player_time(game_state.get('turn'), False)
            self.update_player_time('white' if game_state.get(
                'turn') == 'black' else 'black', 0)

            self.players.get('white').stop_timer()
            self.players.get('black').stop_timer()

        await self.send_game_state()

    async def on_rematch_action(self, user: WS_User, action: dict):
        color = self.get_player_color(user)
        if color is None:
            await user.send({'error': 'You are not a player in this game'})
            return

        if not self.internal_game_state.is_game_over:
            await user.send({'error': 'Game is not over'})
            return

        self.players[color].toggle_new_game_request()
        white_decision = self.players.get(
            'white').internal_state.requestedNewGame if self.players.get('white') is not None else True
        black_decision = self.players.get(
            'black').internal_state.requestedNewGame if self.players.get('black') is not None else True

        if white_decision and black_decision:
            self.reset_game()
            if self.players.get('white') is not None and self.players.get('black') is not None:
                # Swap players colors
                white = self.players.get('white')
                black = self.players.get('black')
                self.players['white'] = black
                self.players['black'] = white

        await self.send_game_state()
