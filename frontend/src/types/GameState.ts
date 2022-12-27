export type PlayerState = {
  nick: string;
  online: boolean;
  timeLeft: number;
  timerStartTs: number;
  isYou: boolean;
};

export type GameState = {
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
    winner: 'white' | 'black' | null | 'draw';
  };
  players: {
    white: PlayerState | null;
    black: PlayerState | null;
  };
};
