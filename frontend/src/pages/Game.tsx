import { Center, Grid, GridItem, useBoolean } from '@chakra-ui/react';
import { Chessboard } from '@components/Chessboard';
import { ChessboardPromotion, ChessboardPromotionReducer } from '@components/ChessboardPromotion';
import { DebugModal, getEngineState } from '@components/DebugModal';
import { GamePanel } from '@components/GamePanel';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';

import { useWebsocketContext } from '../contexts/WebsocketContext';
import { useKeyboard } from '../hooks/useKeyboard';

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

  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
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

  type PlayerState = {
    nick: string;
    online: boolean;
    timeLeft: number;
    lastTurnTs: number;
    isYou: boolean;
  };
  const [players, setPlayers] = useState<{
    white: PlayerState | null;
    black: PlayerState | null;
  }>({
    white: null,
    black: null,
  });

  const [timeControl, setTimeControl] = useState([0, 0]);
  const [gameState, setGameState] = useState<{
    readyToPlay: boolean;
    gameStarted: boolean;
    gameOver: boolean;
    turn: 'white' | 'black' | null;
    winner: 'white' | 'black' | null;
  }>({
    readyToPlay: false,
    gameStarted: false,
    gameOver: false,
    turn: null,
    winner: null,
  });

  const playAs = useMemo(() => {
    return players.black?.isYou ? 'black' : players.white?.isYou ? 'white' : null;
  }, [players]);

  const movable = useMemo(() => {
    return gameState.gameStarted && !gameState.gameOver;
  }, [gameState]);

  useEffect(() => {
    if (lastMessage === null) return;
    switch (lastMessage.type) {
      case 'updateGameState': {
        setTimeControl([lastMessage.timeControl.minutes, lastMessage.timeControl.increment]);
        setFen(lastMessage.fen);
        setGameState({
          readyToPlay: lastMessage.readyToPlay,
          gameStarted: lastMessage.gameStarted,
          gameOver: lastMessage.gameOver,
          turn: lastMessage.turn,
          winner: lastMessage.winner,
        });
        break;
      }
      case 'players': {
        setPlayers({
          white: lastMessage.white,
          black: lastMessage.black,
        });
        break;
      }
    }
  }, [lastMessage]);

  useKeyboard({
    Escape: () => debugModal.toggle(),
  });

  return (
    <>
      <DebugModal data={getEngineState(fen)} isOpen={isDebugModalOpen} onClose={debugModal.off} />
      <Center h="100%">
        <Grid gridTemplateAreas={[`"board" "panel"`, `"board panel"`]} gap={3} alignItems="center">
          <GridItem w={[300, 600]} h={[300, 600]} area="board">
            <Chessboard
              onMove={({ from, to }) => {
                performMove({ from, to });
              }}
              onPromotion={(promotion) => {
                dispatchPromotionPromptAction({
                  type: 'create',
                  ...promotion,
                });
                // TODO
                return Promise.resolve(false);
              }}
              orientation="white"
              fen={fen}
              playAs={playAs}
              movable={movable}
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
                dispatchPromotionPromptAction({ type: 'reset' });
              }}
            />
          </GridItem>
          <GridItem w={[300, 400]} area="panel">
            <GamePanel
              config={{
                id,
                time: timeControl,
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
              game={gameState}
              players={players}
            />
          </GridItem>
        </Grid>
      </Center>
    </>
  );
};
