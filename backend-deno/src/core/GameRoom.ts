import type { WSServerGameMessage } from '../types/WSServerMessage.ts';
import type { WSUser } from './WSUser.ts';
import type { GameClientMessages } from '../validator/validator.ts';

import { ChessGame } from 'chess';
import { GameRoomPlayer } from './GameRoomPlayer.ts';
import { BasicRoomEventMap, WSRoom } from './WSRoom.ts';

type GamePreview = {
  id: string;
  player1: string;
  player2: string;
  time: {
    minutes: number;
    increment: number;
  };
};

type GameRoomState = {
  players: {
    white: null | {
      nick: string;
      online: boolean;
      timeLeft: number;
      lastTurnTs: number;
      isYou: boolean;
    };
    black: null | {
      nick: string;
      online: boolean;
      timeLeft: number;
      lastTurnTs: number;
      isYou: boolean;
    };
  };
  game: {
    fen: string;
    timeControl: {
      minutes: number;
      increment: number;
    };
    readyToPlay: boolean;
    gameStarted: boolean;
    gameOver: boolean;
    turn: 'white' | 'black' | null;
    winner: 'white' | 'black' | 'draw' | null;
  };
};

type GameRoomConfig = {
  id: string;
  private: boolean;
  minutesPerSide: number;
  incrementTime: number;
};

type User = WSUser<GameClientMessages>;

type GameRoomEventMap = BasicRoomEventMap<User> & {
  previewUpdated: [preview: GamePreview];
};

export class GameRoom
  extends WSRoom<User, WSServerGameMessage, GameRoomEventMap> {
  readonly #players = {
    white: null as GameRoomPlayer | null,
    black: null as GameRoomPlayer | null,
  };
  private getPlayerColor(user: User) {
    if (this.#players.white?.isUser(user.uuid)) {
      return 'white';
    }
    if (this.#players.black?.isUser(user.uuid)) {
      return 'black';
    }
    return null;
  }
  readonly #internalGameState = {
    gameStarted: false,
  };
  readonly #config: GameRoomConfig;
  public isPrivate() {
    return this.#config.private;
  }
  constructor(config: GameRoomConfig) {
    super();
    this.#config = config;
    this.on('connect:before', (user) => {
      if (this.#players.white?.isUser(user.uuid)) {
        this.#players.white.reconnect(user);
        this.callUpdate.updatePlayers();
      }
      if (this.#players.black?.isUser(user.uuid)) {
        this.#players.black.reconnect(user);
        this.callUpdate.updatePlayers();
      }
    }).on('connect:after', (user) => {
      const state = this.getUserState(user);
      user.send({
        type: 'players',
        ...state.players,
      });
      user.send({
        type: 'updateGameState',
        ...state.game,
      });
      user.on('message:parse:failed', (e) => {
        user.send({ error: e.message });
      }).on('message:parse:success', (data) => {
        switch (data.type) {
          case 'play': {
            const updated = this.#actions.playAs(user, data.instance.color);
            if (updated) {
              this.callUpdate.updatePlayers();
              this.emit('previewUpdated', this.getPreview());
            }
            break;
          }
          case 'ready': {
            const updated = this.#actions.setReady(user, data.instance.ready);
            if (updated) {
              this.callUpdate.updateGame();
            }
            break;
          }
          case 'move': {
            const updated = this.#actions.playMove(user, data.instance);
            if (updated) {
              this.callUpdate.updateGame();
              this.callUpdate.updatePlayers();
            }
            break;
          }
          case 'offerdraw': {
            const updated = this.#actions.offerdraw(user);
            if (updated) {
              this.callUpdate.updateGame();
            }
            break;
          }
          case 'rematch': {
            const updated = this.#actions.playAgain(user);
            if (updated) {
              this.callUpdate.updateGame();
            }
            break;
          }
          case 'resign': {
            const updated = this.#actions.resign(user);
            if (updated) {
              this.callUpdate.updateGame();
            }
            break;
          }
        }
      });
    }).on('disconnect:after', (user) => {
      if (this.#players.white?.isUser(user.uuid)) {
        this.#players.white.disconnect();
        this.callUpdate.updatePlayers();
      }
      if (this.#players.black?.isUser(user.uuid)) {
        this.#players.black.disconnect();
        this.callUpdate.updatePlayers();
      }
    });
  }
  readonly callUpdate = {
    updatePlayers: () => {
      const state = this.getState();
      this.iterateOverUsers((user) => {
        const userState = this.getUserState(user, structuredClone(state));
        user.send({
          type: 'players',
          ...userState.players,
        });
      });
    },
    updateGame: () => {
      const state = this.getState();
      this.send({
        type: 'updateGameState',
        ...state.game,
      });
    },
  };
  readonly #engine = ChessGame.NewStandardGame();
  private getGameState() {
    const fen = this.#engine.toString('fen');
    const engineStatus = this.#engine.getStatus();
    const gameStarted = this.#internalGameState.gameStarted;
    const gameOver = !(engineStatus.state === 'active');
    const turn = engineStatus.turn;
    const winner = engineStatus.winner || null;
    return {
      fen,
      gameStarted,
      gameOver,
      turn,
      winner,
    };
  }
  private getUserState(user: User, state = this.getState()) {
    if (state.players.white && this.#players.white?.isUser(user.uuid)) {
      state.players.white.isYou = true;
    }
    if (state.players.black && this.#players.black?.isUser(user.uuid)) {
      state.players.black.isYou = true;
    }
    return state;
  }
  private getState(): GameRoomState {
    const { fen, gameStarted, gameOver, turn, winner } = this.getGameState();
    return {
      players: {
        white: this.#players.white
          ? { ...this.#players.white.getState(), isYou: false }
          : null,
        black: this.#players.black
          ? { ...this.#players.black.getState(), isYou: false }
          : null,
      },
      game: {
        timeControl: {
          minutes: this.#config.minutesPerSide,
          increment: this.#config.incrementTime,
        },
        readyToPlay: this.#players.white?.isReady() ||
          this.#players.black?.isReady() || false,
        fen,
        gameStarted,
        gameOver,
        turn,
        winner,
      },
    };
  }
  public getPreview(): GamePreview {
    return {
      id: this.#config.id,
      player1: this.#players.white?.getState().nick || '---',
      player2: this.#players.black?.getState().nick || '---',
      time: {
        minutes: this.#config.minutesPerSide,
        increment: this.#config.incrementTime,
      },
    };
  }
  readonly #actions = {
    playAs: (user: User, color: 'white' | 'black' | 'exit') => {
      const gameState = this.getGameState();
      if (gameState.gameOver || gameState.gameStarted) {
        return false;
      }
      if (color === 'exit') {
        if (this.#players.white?.isUser(user.uuid)) {
          this.#players.white = null;
          return true;
        }
        if (this.#players.black?.isUser(user.uuid)) {
          this.#players.black = null;
          return true;
        }
        return false;
      }
      const oppositeColor = color === 'white' ? 'black' : 'white';
      if (
        this.#players[color] === null &&
        !this.#players[oppositeColor]?.isUser(user.uuid)
      ) {
        const player = new GameRoomPlayer(user);
        player.timeControlState.timeLeft = this.#config.minutesPerSide * 1e3;
        this.#players[color] = player;
        return true;
      }
      return false;
    },
    setReady: (user: User, isReady: boolean) => {
      const color = this.getPlayerColor(user);
      if (color === null) {
        return false;
      }
      this.#players[color]!.setReady(isReady);
      if (this.#players.white?.isReady() && this.#players.black?.isReady()) {
        this.#internalGameState.gameStarted = true;
      }
      return true;
    },
    playMove: (
      user: User,
      data: { from: string; to: string; promotion?: string },
    ) => {
      const color = this.getPlayerColor(user);
      if (color === null) {
        return false;
      }
      const gameState = this.getGameState();
      if (!gameState.gameStarted || gameState.gameOver) {
        return false;
      }
      if (gameState.turn !== color) {
        return false;
      }
      try {
        this.#engine.move({
          from: data.from,
          dest: data.to,
          promotion: data.promotion as 'B' | 'N' | 'R' | 'Q' | undefined,
        });
        return true;
      } catch (_) {
        return false;
      }
    },
    resign: (user: User) => {
      const color = this.getPlayerColor(user);
      if (color === null) {
        return false;
      }
      const gameState = this.getGameState();
      if (!gameState.gameStarted || gameState.gameOver) {
        return false;
      }
      this.#engine.resignGame(color);
      return true;
    },
    offerdraw: (_user: User) => {
      // not implemented
      return false;
    },
    playAgain: (_user: User) => {
      // not implemented
      return false;
    },
  };
}
