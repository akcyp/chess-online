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
      timerStartTs: number;
      isYou: boolean;
    };
    black: null | {
      nick: string;
      online: boolean;
      timeLeft: number;
      timerStartTs: number;
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
    rematchOffered: boolean;
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
        this.callUpdate.updateGame();
      }
      if (this.#players.black?.isUser(user.uuid)) {
        this.#players.black.reconnect(user);
        this.callUpdate.updateGame();
      }
    }).on('connect:after', (user) => {
      const state = this.getUserState(user);
      user.send({
        type: 'updateGameState',
        ...state,
      });
      user.on('message:parse:failed', (e) => {
        user.send({ error: e.message });
      }).on('message:parse:success', (data) => {
        switch (data.type) {
          case 'play': {
            const updated = this.#actions.playAs(user, data.instance.color);
            if (updated) {
              this.callUpdate.updateGame();
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
        this.callUpdate.updateGame();
      }
      if (this.#players.black?.isUser(user.uuid)) {
        this.#players.black.disconnect();
        this.callUpdate.updateGame();
      }
    });
  }
  readonly callUpdate = {
    updateGame: () => {
      const state = this.getState();
      this.iterateOverUsers((user) => {
        const userState = this.getUserState(user, structuredClone(state));
        user.send({
          type: 'updateGameState',
          ...userState,
        });
      });
    },
  };
  readonly #internalGameState = {
    engine: ChessGame.NewStandardGame(),
    gameStarted: false,
  };
  private getGameState() {
    const fen = this.#internalGameState.engine.toString('fen');
    const engineStatus = this.#internalGameState.engine.getStatus();
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
        rematchOffered: (this.#players.white?.isNewGameRequested() ?? true) ||
          (this.#players.black?.isNewGameRequested() ?? true),
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
      if (color === 'exit') {
        if (gameState.gameStarted && !gameState.gameOver) {
          return false;
        }
        if (this.#players.white?.isUser(user.uuid)) {
          this.#players.white = null;
          return true;
        }
        if (this.#players.black?.isUser(user.uuid)) {
          this.#players.black = null;
          return true;
        }
        if (
          gameState.gameOver && this.#players.white === null &&
          this.#players.black === null
        ) {
          this.resetGame();
        }
        return false;
      }
      if (gameState.gameStarted || gameState.gameOver) {
        return false;
      }
      const oppositeColor = color === 'white' ? 'black' : 'white';
      if (
        this.#players[color] === null &&
        !this.#players[oppositeColor]?.isUser(user.uuid)
      ) {
        const player = new GameRoomPlayer(user);
        player.timeControlState.timeLeft = this.#config.minutesPerSide * 60 *
          1e3;
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
        // Start game
        this.#internalGameState.gameStarted = true;
        this.updatePlayerTime('white', 0);
        this.updatePlayerTime('black', 0);
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
        this.#internalGameState.engine.move({
          from: data.from,
          dest: data.to,
          promotion: data.promotion as 'B' | 'N' | 'R' | 'Q' | undefined,
        });
        this.recalcPlayerTime(color);
        this.updatePlayerTime(color === 'white' ? 'black' : 'white');
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
      this.recalcPlayerTime(gameState.turn);
      this.updatePlayerTime(gameState.turn === 'white' ? 'black' : 'white');
      this.#internalGameState.engine.resignGame(color);
      return true;
    },
    offerdraw: (_user: User) => {
      // not implemented
      return false;
    },
    playAgain: (user: User) => {
      const color = this.getPlayerColor(user);
      if (color === null) {
        return false;
      }
      this.#players[color]!.setNewGameRequest(true);
      const whiteDecision = this.#players.white
        ? this.#players.white.isNewGameRequested()
        : true;
      const blackDecision = this.#players.black
        ? this.#players.black.isNewGameRequested()
        : true;
      if (whiteDecision && blackDecision) {
        // Reset game
        this.resetGame();
        // Swap colors
        if (this.#players.white && this.#players.black) {
          [this.#players.white, this.#players.black] = [
            this.#players.black,
            this.#players.white,
          ];
        }
      }
      return true;
    },
  };
  private resetGame() {
    this.#internalGameState.gameStarted = false;
    this.#internalGameState.engine = ChessGame.NewStandardGame();
    this.#players.white?.reset(this.#config.minutesPerSide * 60 * 1e3);
    this.#players.black?.reset(this.#config.minutesPerSide * 60 * 1e3);
  }
  private recalcPlayerTime(color: 'white' | 'black') {
    const player = this.#players[color]!;
    this.updatePlayerTime(
      color,
      Date.now() - player.timeControlState.timerStartTs -
        this.#config.incrementTime * 1e3,
    );
  }
  private updatePlayerTime(color: 'white' | 'black', diff = 0) {
    const player = this.#players[color]!;
    player.timeControlState.timeLeft -= diff;
    player.timeControlState.timerStartTs = Date.now();
  }
}
