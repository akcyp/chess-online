export type GameState = {
  readyToPlay: boolean;
  rematchOffered: boolean;
  gameStarted: boolean;
  gameOver: boolean;
  turn: 'white' | 'black' | null;
  winner: 'white' | 'black' | null | 'draw';
};
