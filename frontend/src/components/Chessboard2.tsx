import { createComponent } from '@lit-labs/react';
import { ChessBoardElement } from 'chessboard-element';
import * as React from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

export const ChessboardNative = createComponent({
  tagName: 'chess-board',
  elementClass: ChessBoardElement,
  react: React,
  events: {},
  displayName: 'ChessBoardNative',
});

export type ChessboardActions = {
  fen(): string | boolean | undefined;
};

export type ChessboardProps = {
  fen?: 'start';
};

export const Chessboard = forwardRef<ChessboardActions, ChessboardProps>(({ fen }, ref) => {
  useImperativeHandle(ref, () => ({
    fen() {
      return nativeRef.current?.fen();
    },
  }));
  const onLoad = useCallback(() => {
    console.log('loaded');
    if (fen) {
      nativeRef.current?.setPosition(fen);
    }
  }, []);
  const nativeRef = useRef<ChessBoardElement>(null);
  return <ChessboardNative ref={nativeRef} onLoad={onLoad}></ChessboardNative>;
});

Chessboard.displayName = 'Chessboard';
