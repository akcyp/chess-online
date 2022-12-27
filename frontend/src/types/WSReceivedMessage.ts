export type WSReceivedLobbyMessage =
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

export type WSReceivedGameMessage = {
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
    winner: 'draw' | 'white' | 'black' | null;
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

export type WSReceivedMessage = WSReceivedLobbyMessage | WSReceivedGameMessage;
