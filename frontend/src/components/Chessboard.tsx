import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

import { Chess, Move } from 'chess.js';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Config } from 'chessground/config';
import type { Key, Piece } from 'chessground/types';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import styled from 'styled-components';

const BoardContainer = styled.div`
  width: 500px;
  height: 500px;
  display: table;
`;

export type ChessboardProps = {
  onLoad?: (api: Api) => void;
  orientation?: 'white' | 'black';
  onMove?: (from: Key, to: Key, capturedPiece?: Piece) => void;
};

export type ChessboardActions = {
  getApi(): Api;
  setFen(fen: string): void;
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

export const Chessboard = forwardRef<ChessboardActions, ChessboardProps>(
  ({ onLoad = () => void 0, onMove = () => void 0 }, ref) => {
    const nativeRef = useRef<HTMLDivElement>(null);
    const [board, setBoard] = useState<Api | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        getApi() {
          if (!board) {
            throw new Error('Board not initialized');
          }
          return board;
        },
        setFen(fen: string) {
          const chess = new Chess();
          try {
            const loaded = chess.load(fen);
            if (!loaded) {
              throw new Error('Failed to load fen');
            }
          } catch (err) {
            console.error(err);
            return false;
          }
          this.getApi().set({
            fen,
            check: chess.isCheck(),
            movable: {
              color: chess.turn() === 'w' ? 'white' : 'black',
              dests: getMovesFromEngine(chess),
              free: false,
              showDests: true,
            },
          });
          return true;
        },
      }),
      [board],
    );

    useEffect(() => {
      if (board) {
        onLoad(board);
      }
    }, [board]);

    useEffect(() => {
      if (nativeRef.current && !board) {
        const api = Chessground(nativeRef.current, {
          orientation: 'white',
          animation: { enabled: true, duration: 200 },
          movable: {
            color: 'white',
            free: false,
            showDests: true,
            dests: new Map(),
          },
          events: {
            move(orig, dest, capturedPiece) {
              onMove(orig, dest, capturedPiece);
            },
          },
        });
        setBoard(api);
      }
    }, [nativeRef]);

    return <BoardContainer ref={nativeRef} />;
  },
);

Chessboard.displayName = 'Chessboard';

export { Api, Config };
