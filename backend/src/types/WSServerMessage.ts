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
  type: 'updateGameState';
  game: {
    fen: string;
    timeControl: {
      minutes: number;
      increment: number;
    };
    readyToPlay: boolean;
    rematchOffered: boolean;
    drawOffered: boolean;
    gameStarted: boolean;
    gameOver: boolean;
    turn: 'white' | 'black' | null;
    winner: 'white' | 'black' | 'draw' | null;
  };
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
};

export type WSServerMessage = WSServerLobbyMessage | WSServerGameMessage;
