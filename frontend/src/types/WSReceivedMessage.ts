export type WSReceivedLobbyMessage =
  | {
      type: 'updateGames';
      games: {
        id: string;
        player1: string;
        player2: string;
        time: number[];
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

export type WSReceivedGameMessage =
  | {
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
    }
  | {
      type: 'updateGameState';
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
      winner: 'draw' | 'white' | 'black' | null;
    };

export type WSReceivedMessage = WSReceivedLobbyMessage | WSReceivedGameMessage;
