import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

import { Chess, Move, PieceSymbol } from 'chess.js';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Config } from 'chessground/config';
import type { Key } from 'chessground/types';
import { useEffect, useRef, useState } from 'react';
import { findPromotionMoves } from 'src/helpers/findPromotionMoves';
import styled from 'styled-components';

const BoardContainer = styled.div`
  width: 100%;
  height: 100%;
  display: table;
`;

export type ChessboardProps = {
  orientation?: 'white' | 'black';
  onMove?: (data: { from: Key; to: Key }) => void;
  onPromotion?: (promotion: {
    possiblePromotions: PieceSymbol[];
    color: 'white' | 'black';
    from: string;
    to: string;
  }) => Promise<boolean>;
  playAs: 'white' | 'black' | null;
  movable: boolean;
  fen: string;
};

const getMovesFromEngine = (engine: Chess) => {
  const moves = engine.moves({ verbose: true }) as Move[];
  return moves.reduce((acc, move) => {
    if (!acc.has(move.from)) {
      acc.set(move.from, []);
    }
    acc.get(move.from)?.push(move.to);
    return acc;
  }, new Map());
};

export const Chessboard = ({
  onMove = () => void 0,
  onPromotion = () => Promise.resolve(false),
  orientation,
  playAs,
  movable,
  fen,
}: ChessboardProps) => {
  const nativeRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<Api | null>(null);

  useEffect(() => {
    const chess = new Chess();
    try {
      const loaded = chess.load(fen);
      if (!loaded) {
        throw new Error('Failed to load fen');
      }
    } catch (err) {
      console.error(err);
      return;
    }
    const turn = chess.turn() === 'w' ? 'white' : 'black';
    board?.set({
      fen,
      check: chess.isCheck(),
      movable: {
        color: playAs || 'white',
        dests: playAs === turn && movable ? getMovesFromEngine(chess) : new Map(),
        free: false,
        showDests: true,
      },
      turnColor: turn,
      selectable: {
        enabled: movable,
      },
      premovable: {
        enabled: false,
      },
    });
  }, [board, movable, playAs, fen]);

  useEffect(() => {
    board?.set({
      events: {
        move(from, to) {
          const engine = new Chess(fen);
          const turnColor = engine.turn() === 'w' ? 'white' : 'black';
          const promotions = findPromotionMoves(engine, from, to);
          if (promotions.possiblePromotions.length > 0) {
            onPromotion(promotions).then((promotionPassed) => {
              if (!promotionPassed) {
                board.set({
                  fen,
                  turnColor,
                  check: engine.isCheck(),
                  movable: {
                    color: turnColor,
                    dests: getMovesFromEngine(engine),
                    free: false,
                    showDests: true,
                  },
                });
              }
            });
          } else {
            onMove({ from, to });
          }
        },
      },
    });
  }, [onMove, onPromotion, fen]);

  useEffect(() => {
    board?.toggleOrientation();
  }, [orientation]);

  useEffect(() => {
    if (nativeRef.current && !board) {
      const api = Chessground(nativeRef.current, {
        orientation,
        disableContextMenu: true,
        animation: { enabled: true, duration: 200 },
        movable: {
          color: undefined,
          free: false,
          showDests: true,
          dests: new Map(),
        },
        selectable: {
          enabled: false,
        },
        premovable: {
          enabled: false,
        },
        events: {
          move(from, to) {
            const engine = new Chess(fen);
            const promotions = findPromotionMoves(engine, from, to);
            if (promotions.possiblePromotions.length > 0) {
              onPromotion(promotions).then((promotionPassed) => {
                if (!promotionPassed) {
                  api.set({
                    fen,
                  });
                }
              });
            } else {
              onMove({ from, to });
            }
          },
        },
      });
      setBoard(api);
    }
  }, [nativeRef]);

  return <BoardContainer ref={nativeRef} />;
};

export { Api, Config };
