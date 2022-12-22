import { ChessGame } from 'chess';
// console.log("Add 2 + 3 =", add(2, 3));
// const game = ChessGame.NewFromFEN(
//   "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 16 9"
// );
// console.log(game.toString("terminal"));
// console.log(game.getStatus());

export type GameRoomState = {
  players: {
    white: null;
    black: null;
  };
};

export class GameRoom {
  #engine = ChessGame.NewStandardGame();
  getState(): GameRoomState {
    return {
      players: {
        white: null,
        black: null,
      },
    };
  }
}
