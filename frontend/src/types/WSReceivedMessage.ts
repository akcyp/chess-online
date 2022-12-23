export type WSReceivedMessage =
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
