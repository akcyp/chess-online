export type WSServerLobbyMessage =
  | {
    error: string;
  }
  | {
    type: 'updateGames';
    games: {
      id: string;
      player1: string;
      player2: string;
      time: {
        minutes: number;
        increment: number;
      };
    }[];
  }
  | {
    type: 'updatePlayers';
    count: number;
  }
  | {
    type: 'gameCreated';
    id?: string;
    error?: string;
  };

export type WSServerGameMessage = {
  type: 'players';
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
} | {
  type: 'updateGameState';
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

export type WSServerMessage = WSServerLobbyMessage | WSServerGameMessage;
