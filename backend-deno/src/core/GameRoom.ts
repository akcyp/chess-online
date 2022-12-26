import { ChessGame } from 'chess';
import { WSServerGameMessage } from '../types/WSServerMessage.ts';
import { GameRoomPlayer } from './GameRoomPlayer.ts';
import { User } from './User.ts';

export type GameRoomState = {
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

export type GameRoomConfig = {
  id: string;
  private: boolean;
  minutesPerSide: number;
  incrementTime: number;
};

export class GameRoom {
  #config: GameRoomConfig;
  #players = {
    white: null as null | GameRoomPlayer,
    black: null as null | GameRoomPlayer,
  };
  #gameStarted = false;
  constructor(config: GameRoomConfig) {
    this.#config = config;
  }
  #engine = ChessGame.NewStandardGame();
  isPrivate() {
    return this.#config.private;
  }
  getGameState() {
    const fen = this.#engine.toString('fen');
    const engineStatus = this.#engine.getStatus();
    const gameStarted = this.#gameStarted;
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
  getState(payloadRequester?: User): GameRoomState {
    const { fen, gameStarted, gameOver, turn, winner } = this.getGameState();
    return {
      players: {
        white: this.#players.white
          ? this.#players.white.getState(payloadRequester)
          : null,
        black: this.#players.black
          ? this.#players.black.getState(payloadRequester)
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
  getPreview() {
    return {
      id: this.#config.id,
      player1: this.#players.white?.getState().nick || '---',
      player2: this.#players.black?.getState().nick || '---',
      time: [this.#config.minutesPerSide, this.#config.incrementTime],
    };
  }
  #users = new Set<User>();
  addUser(user: User) {
    if (this.#players.white?.isUser(user.uuid)) {
      this.#players.white.reconnect(user);
      this.updatePlayers();
    }
    if (this.#players.black?.isUser(user.uuid)) {
      this.#players.black.reconnect(user);
      this.updatePlayers();
    }
    this.#users.add(user);
    const state = this.getState(user);
    user.send({
      type: 'players',
      ...state.players,
    });
    user.send({
      type: 'updateGameState',
      ...state.game,
    });
  }
  deleteUser(user: User) {
    this.#users.delete(user);
    if (this.#players.white?.isUser(user.uuid)) {
      this.#players.white.disconnect();
      this.updatePlayers();
    }
    if (this.#players.black?.isUser(user.uuid)) {
      this.#players.black.disconnect();
      this.updatePlayers();
    }
  }
  emit(message: WSServerGameMessage | ((user: User) => WSServerGameMessage)) {
    this.#users.forEach((user) => {
      const data = message instanceof Function ? message(user) : message;
      user.send(data);
    });
  }
  playAs(user: User, color: 'white' | 'black' | 'exit') {
    const gameState = this.getGameState();
    if (gameState.gameOver || gameState.gameStarted) {
      return false;
    }
    let updated = false;
    if (color === 'exit') {
      if (this.#players.white?.isUser(user.uuid)) {
        this.#players.white = null;
        updated = true;
      }
      if (this.#players.black?.isUser(user.uuid)) {
        this.#players.black = null;
        updated = true;
      }
    }
    if (
      color === 'white' && this.#players.white === null &&
      !this.#players.black?.isUser(user.uuid)
    ) {
      this.#players.white = new GameRoomPlayer(user);
      updated = true;
    }
    if (
      color === 'black' && this.#players.black === null &&
      !this.#players.white?.isUser(user.uuid)
    ) {
      this.#players.black = new GameRoomPlayer(user);
      updated = true;
    }
    if (updated) {
      this.updatePlayers();
    }
    return updated;
  }
  setReady(user: User, isReady: boolean) {
    let updated = false;
    if (this.#players.white?.isUser(user.uuid)) {
      this.#players.white.setReady(isReady);
      updated = true;
    }
    if (this.#players.black?.isUser(user.uuid)) {
      this.#players.black.setReady(isReady);
      updated = true;
    }
    if (this.#players.white?.isReady() && this.#players.black?.isReady()) {
      this.#gameStarted = true;
    }
    if (updated) {
      const state = this.getState();
      this.emit({
        type: 'updateGameState',
        ...state.game,
      });
    }
  }
  playMove(user: User, data: { from: string; to: string; promotion?: string }) {
    const gameState = this.getGameState();
    if (!gameState.gameStarted || gameState.gameOver) {
      return;
    }
    if (
      (this.#players.white?.isUser(user.uuid) && gameState.turn === 'white') ||
      (this.#players.black?.isUser(user.uuid) && gameState.turn === 'black')
    ) {
      try {
        this.#engine.move({
          from: data.from,
          dest: data.to,
          promotion: data.promotion as 'B' | 'N' | 'R' | 'Q' | undefined,
        });
        const state = this.getState();
        this.emit({
          type: 'updateGameState',
          ...state.game,
        });
      } catch (_) {
        void 0;
      }
    }
  }
  resign(user: User) {
    let updated = false;
    const gameState = this.getGameState();
    if (!gameState.gameStarted || gameState.gameOver) {
      return;
    }
    if (this.#players.white?.isUser(user.uuid)) {
      this.#engine.resignGame('white');
      updated = true;
    }
    if (this.#players.black?.isUser(user.uuid)) {
      this.#engine.resignGame('black');
      updated = true;
    }
    if (updated) {
      const state = this.getState();
      this.emit({
        type: 'updateGameState',
        ...state.game,
      });
    }
  }
  offerdraw(_user: User) {
    // not implemented
  }
  updatePlayers() {
    this.emit((user) => {
      const state = this.getState(user);
      return {
        type: 'players',
        ...state.players,
      };
    });
  }
}
