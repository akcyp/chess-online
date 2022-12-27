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
  config: {
    playAs: 'white' | 'black' | null;
    movable: boolean;
    fen: string;
  };
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
  config,
}: ChessboardProps) => {
  const nativeRef = useRef<HTMLDivElement>(null);
  const ignoreNextFenUpdate = useRef(false);
  const [board, setBoard] = useState<Api | null>(null);

  useEffect(() => {
    const chess = new Chess();
    try {
      const loaded = chess.load(config.fen);
      if (!loaded) {
        throw new Error('Failed to load fen');
      }
    } catch (err) {
      console.error(err);
      return;
    }
    const turn = chess.turn() === 'w' ? 'white' : 'black';
    board?.set({
      check: chess.isCheck(),
      movable: {
        color: config.playAs || 'white',
        dests: config.playAs === turn && config.movable ? getMovesFromEngine(chess) : new Map(),
        free: false,
        showDests: true,
      },
      turnColor: turn,
      selectable: {
        enabled: true,
      },
      premovable: {
        enabled: false,
      },
    });
  }, [board, config]);

  useEffect(() => {
    if (ignoreNextFenUpdate.current === false) {
      board?.set({
        fen: config.fen,
      });
    } else {
      ignoreNextFenUpdate.current = false;
    }
  }, [config.fen]);

  useEffect(() => {
    board?.set({
      events: {
        move(from, to) {
          const engine = new Chess(config.fen);
          const turnColor = engine.turn() === 'w' ? 'white' : 'black';
          const promotions = findPromotionMoves(engine, from, to);
          if (promotions.possiblePromotions.length > 0) {
            onPromotion(promotions).then((promotionPassed) => {
              if (!promotionPassed) {
                board.set({
                  fen: config.fen,
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
            ignoreNextFenUpdate.current = true;
            onMove({ from, to });
          }
        },
      },
    });
  }, [board, config.fen, onMove, onPromotion]);

  useEffect(() => {
    board?.set({ orientation: orientation });
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
      });
      setBoard(api);
    }
  }, [nativeRef]);

  return <BoardContainer ref={nativeRef} />;
};

export { Api, Config };
