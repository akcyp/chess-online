import { Center, Grid, GridItem, useBoolean } from '@chakra-ui/react';
import { Chessboard, ChessboardActions } from '@components/Chessboard';
import { DebugModal } from '@components/DebugModal';
import { GamePanel } from '@components/GamePanel';
import { Chess } from 'chess.js';
import { useCallback, useRef, useState } from 'react';
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';

import { useKeyboard } from '../hooks/useKeyboard';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = params['id'] || '';
  console.log(id); // validate
  return { id };
};

export const GamePage = () => {
  const { id } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();

  const [engine] = useState(new Chess());
  const [fen, setFen] = useState(engine.fen());
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [isDebugModalOpen, debugModal] = useBoolean(false);

  const ref = useRef<ChessboardActions>(null);

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

  useKeyboard({
    Escape: () => debugModal.toggle(),
  });

  const state = {
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
  };

  return (
    <>
      <DebugModal data={state} isOpen={isDebugModalOpen} onClose={debugModal.off} />
      <Center h="80vh">
        <Grid templateColumns="496px 1fr" alignItems="center">
          <GridItem w="496px">
            <Chessboard ref={ref} onLoad={onLoad} onMove={onMove}></Chessboard>
          </GridItem>
          <GridItem w={400}>
            <GamePanel
              config={{
                id,
                time: [5, 3],
                orientation,
              }}
              events={{
                toggleOrientation: () => {
                  setOrientation((o) => (o === 'black' ? 'white' : 'black'));
                  ref.current?.getApi().toggleOrientation();
                },
                offerDraw: () => void 0,
                resign: () => void 0,
                offerRematch: () => void 0,
                exit: () => navigate('/'),
              }}
              game={{
                gameOver: state.isGameOver,
                turn: state.turn === 'w' ? 'white' : 'black',
              }}
              players={{
                white: {
                  nick: 'TestUser#1236',
                  online: true,
                  timeLeft: 65 * 1e3,
                  lastTurnTs: Date.now(),
                },
                black: {
                  nick: 'TestPlayer#1539',
                  online: false,
                  timeLeft: 5 * 1e3,
                  lastTurnTs: Date.now(),
                },
              }}
            />
          </GridItem>
        </Grid>
      </Center>
    </>
  );
};
