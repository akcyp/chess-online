import { Center, Grid, GridItem, useBoolean } from '@chakra-ui/react';
import { Chessboard, ChessboardProps } from '@components/Chessboard';
import { ChessboardPromotion, ChessboardPromotionReducer } from '@components/ChessboardPromotion';
import { DebugModal, getEngineState } from '@components/DebugModal';
import { GamePanel } from '@components/GamePanel';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';

import { useWebsocketContext } from '../contexts/WebsocketContext';
import { useKeyboard } from '../hooks/useKeyboard';
import type { GameState } from '../types/GameState';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id = '' } = params;
  const response: { id: string; auth: { username: string } } = await fetch(
    `https://${window.API_URL}/api/game/${id}`,
  ).then((res) => res.json());
  return { id: response.id, auth: response.auth };
};

export const GamePage = () => {
  const { id } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();
  const { send, lastMessage } = useWebsocketContext();

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
    [send],
  );

  const [gameState, setGameState] = useState<GameState>({
    game: {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      timeControl: {
        minutes: 0,
        increment: 0,
      },
      readyToPlay: false,
      rematchOffered: false,
      gameStarted: false,
      gameOver: false,
      turn: null,
      winner: null,
    },
    players: {
      white: null,
      black: null,
    },
  });

  const playAs = useMemo(() => {
    return gameState.players.black?.isYou ? 'black' : gameState.players.white?.isYou ? 'white' : null;
  }, [gameState.players]);

  const movable = useMemo(() => {
    return gameState.game.gameStarted && !gameState.game.gameOver;
  }, [gameState.game]);

  useEffect(() => {
    if (lastMessage === null) return;
    switch (lastMessage.type) {
      case 'updateGameState': {
        if (!gameState.game.gameStarted && lastMessage.game.gameStarted) {
          if (playAs !== null) {
            setOrientation(playAs);
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { type: _, ...rest } = lastMessage;
        setGameState(rest);
        break;
      }
    }
  }, [lastMessage]);

  useKeyboard({
    Escape: () => debugModal.toggle(),
  });

  const onPromotion = useCallback<NonNullable<ChessboardProps['onPromotion']>>(
    (promotion) => {
      return new Promise((res) => {
        dispatchPromotionPromptAction({
          type: 'create',
          callback: (v) => res(v),
          ...promotion,
        });
      });
    },
    [dispatchPromotionPromptAction],
  );

  return (
    <>
      <DebugModal data={getEngineState(gameState.game.fen)} isOpen={isDebugModalOpen} onClose={debugModal.off} />
      <Center h="100%">
        <Grid gridTemplateAreas={[`"board" "panel"`, `"board panel"`]} gap={3} alignItems="center">
          <GridItem w={[300, 600]} h={[300, 600]} area="board">
            <Chessboard
              onMove={performMove}
              onPromotion={onPromotion}
              orientation={orientation}
              config={{
                fen: gameState.game.fen,
                playAs,
                movable,
              }}
            />
            <ChessboardPromotion
              isOpen={promotionPrompt.isOpen}
              color={promotionPrompt.color}
              possiblePromotions={promotionPrompt.possiblePromotions}
              onSelect={(selected) => {
                if (promotionPrompt.from && promotionPrompt.to) {
                  performMove({ from: promotionPrompt.from, to: promotionPrompt.to, promotion: selected });
                }
                dispatchPromotionPromptAction({ type: 'reset', success: true });
              }}
              onAbort={() => {
                dispatchPromotionPromptAction({ type: 'reset' });
              }}
            />
          </GridItem>
          <GridItem w={[300, 400]} area="panel">
            <GamePanel
              config={{
                id,
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
              gameState={gameState}
            />
          </GridItem>
        </Grid>
      </Center>
    </>
  );
};
