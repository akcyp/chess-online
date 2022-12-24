import type { Chess, Move, PieceSymbol } from 'chess.js';

export const findPromotionMoves = (engine: Chess, from: string, to: string) => {
  const possibleMoves = engine.moves({ verbose: true }) as Move[];
  const possiblePromotionMoves = possibleMoves
    .filter((move) => move.from === from && move.to === to)
    .filter((move) => move.flags.includes('p') && ['n', 'r', 'q', 'b'].includes(move.promotion ?? ''));
  const possiblePromotions = possiblePromotionMoves.map((move) => move.promotion) as PieceSymbol[];
  return {
    possiblePromotions,
    color: (possiblePromotionMoves?.[0]?.color === 'w' ? 'white' : 'black') as 'white' | 'black',
    from,
    to,
  };
};
