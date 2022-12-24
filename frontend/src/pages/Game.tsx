import { Center, Grid, GridItem, useBoolean } from '@chakra-ui/react';
import { Chessboard, ChessboardActions } from '@components/Chessboard';
import { ChessboardPromotion, ChessboardPromotionReducer } from '@components/ChessboardPromotion';
import { DebugModal, getEngineState } from '@components/DebugModal';
import { GamePanel } from '@components/GamePanel';
import { Chess } from 'chess.js';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';
import { findPromotionMoves } from 'src/helpers/findPromotionMoves';

import { useWebsocketContext } from '../contexts/WebsocketContext';
import { useKeyboard } from '../hooks/useKeyboard';

const API_URL = 'localhost:3000';
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id = '' } = params;
  const response = (await fetch(`http://${API_URL}/api/game/${id}`).then((res) => res.json())) as { id: string };
  return { id: response.id };
};

export const GamePage = () => {
  const { id } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();
  const { send, lastMessage } = useWebsocketContext();
  const ref = useRef<ChessboardActions>(null);

  const [engine] = useState(new Chess());
  const [fen, setFen] = useState(engine.fen());
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [isDebugModalOpen, debugModal] = useBoolean(false);
  const [promotionPrompt, dispatchPromotionPromptAction] = useReducer(ChessboardPromotionReducer, {
    isOpen: false,
  });

  const performMove = useCallback(
    (moveData: { from: string; to: string; promotion?: string }) => {
      send({
        type: 'move',
        ...moveData,
      });
    },
    [ref, engine, send],
  );

  useKeyboard({
    Escape: () => debugModal.toggle(),
  });

  useEffect(() => {
    if (lastMessage === null) return;
    // switch (lastMessage.type) {
    // };
  }, [lastMessage]);

  return (
    <>
      <DebugModal data={getEngineState(fen, engine)} isOpen={isDebugModalOpen} onClose={debugModal.off} />
      <Center h="100%">
        <Grid gridTemplateAreas={[`"board" "panel"`, `"board panel"`]} gap={3} alignItems="center">
          <GridItem w={[300, 600]} h={[300, 600]} area="board">
            <Chessboard
              ref={ref}
              onLoad={() => {
                ref.current?.setFen(fen);
              }}
              onMove={(from, to) => {
                const promotions = findPromotionMoves(engine, from, to);
                if (promotions.possiblePromotions.length > 0) {
                  dispatchPromotionPromptAction({
                    type: 'create',
                    ...promotions,
                  });
                } else {
                  performMove({ from, to });
                }
              }}
              orientation="white"
              playAs="white"
            />
            <ChessboardPromotion
              isOpen={promotionPrompt.isOpen}
              color={promotionPrompt.color}
              possiblePromotions={promotionPrompt.possiblePromotions}
              onSelect={(selected) => {
                if (promotionPrompt.from && promotionPrompt.to) {
                  performMove({ from: promotionPrompt.from, to: promotionPrompt.to, promotion: selected });
                }
                dispatchPromotionPromptAction({ type: 'reset' });
              }}
              onAbort={() => {
                ref.current?.setFen(engine.fen(), { movable: true });
                dispatchPromotionPromptAction({ type: 'reset' });
              }}
            />
          </GridItem>
          <GridItem w={[300, 400]} area="panel">
            <GamePanel
              config={{
                id,
                time: [5, 3],
                orientation,
              }}
              events={{
                askForStart: () => send({ type: 'ready', ready: true }),
                playAsWhite: () => send({ type: 'play', color: 'white' }),
                playAsBlack: () => send({ type: 'play', color: 'black' }),
                exitPlay: () => send({ type: 'play', color: 'exit' }),
                toggleOrientation: () => {
                  setOrientation((o) => (o === 'black' ? 'white' : 'black'));
                },
                offerDraw: () => send({ type: 'offerdraw' }),
                resign: () => send({ type: 'resign' }),
                offerRematch: () => send({ type: 'rematch' }),
                exit: () => navigate('/'),
              }}
              game={{
                readyToPlay: false,
                gameStarted: false,
                gameOver: false,
                turn: null,
                winner: null,
              }}
              players={{
                white: {
                  nick: 'TestUser#1236',
                  online: true,
                  timeLeft: 65 * 1e3,
                  lastTurnTs: Date.now(),
                },
                black: null,
              }}
            />
          </GridItem>
        </Grid>
      </Center>
    </>
  );
};
