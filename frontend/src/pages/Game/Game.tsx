import './Game.css';

import { Grid, GridItem } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { Chessboard, ChessboardActions } from '@components/Chessboard';
import { Chess } from 'chess.js';
import { useCallback, useRef, useState } from 'react';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = params['id'] || '';
  console.log(id); // validate
  return { id };
};

export const Game = () => {
  const { id } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const ref = useRef<ChessboardActions>(null);
  const [engine] = useState(new Chess());
  const [fen, setFen] = useState(engine.fen());

  const toggleOrientation = useCallback(() => {
    ref.current?.getApi().toggleOrientation();
  }, [ref]);

  const onLoad = useCallback(() => {
    console.log(ref.current);
    ref.current?.setFen(engine.fen());
  }, [ref, engine]);

  const onMove = useCallback(
    (from: string, to: string) => {
      engine.move({ from, to });
      ref.current?.setFen(engine.fen());
      setFen(engine.fen());
    },
    [ref, engine],
  );

  const code = JSON.stringify(
    {
      fen,
      history: engine.history().join(' '),
      turn: engine.turn(),
      isCheck: engine.isCheck(),
      inCheck: engine.inCheck(),
      isCheckmate: engine.isCheckmate(),
      isStalemate: engine.isStalemate(),
      isInsufficientMaterial: engine.isInsufficientMaterial(),
      isThreefoldRepetition: engine.isThreefoldRepetition(),
      isDraw: engine.isDraw(),
      isGameOver: engine.isGameOver(),
    },
    undefined,
    2,
  );

  return (
    <Grid templateColumns="repeat(5, 1fr)" gap={6}>
      <GridItem w="100%" h="10%0">
        <div>Game id: {id}</div>
        <Chessboard ref={ref} onLoad={onLoad} onMove={onMove}></Chessboard>
      </GridItem>
      <GridItem w="100%" h="10%0">
        <Button onClick={toggleOrientation}>Toggle orientation</Button>
        <SyntaxHighlighter style={monokai} language="json">
          {code}
        </SyntaxHighlighter>
      </GridItem>
    </Grid>
  );
};
