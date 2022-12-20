import { Center, Grid, GridItem, useBoolean } from '@chakra-ui/react';
import { Chessboard, ChessboardActions } from '@components/Chessboard';
import { ChessboardPromotion } from '@components/ChessboardPromotion';
import { DebugModal } from '@components/DebugModal';
import { GamePanel } from '@components/GamePanel';
import { Chess, Move, PieceSymbol } from 'chess.js';
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
  const [promotionPrompt, setPromotionPrompt] = useState({
    possiblePieces: [] as PieceSymbol[],
    isOpen: false,
    from: null as string | null,
    to: null as string | null,
    color: 'w' as null | 'w' | 'b',
  });

  const ref = useRef<ChessboardActions>(null);

  const onLoad = useCallback(() => {
    console.log(ref.current);
    ref.current?.setFen(engine.fen());
  }, [ref, engine]);

  const performMove = useCallback(
    ({ from, to, promotion }: { from: string; to: string; promotion?: string }) => {
      engine.move({ from, to, promotion });
      ref.current?.setFen(engine.fen(), { movable: true });
      setFen(engine.fen());
    },
    [ref, engine],
  );

  const onMove = useCallback(
    (from: string, to: string) => {
      const possibleMoves = engine.moves({ verbose: true }) as Move[];
      const possiblePromotionMoves = possibleMoves
        .filter((move) => move.from === from && move.to === to)
        .filter((move) => move.flags.includes('p') && ['n', 'r', 'q', 'b'].includes(move.promotion ?? ''));
      const possiblePromotions = possiblePromotionMoves.map((move) => move.promotion) as PieceSymbol[];

      if (possiblePromotions.length > 0) {
        setPromotionPrompt({
          isOpen: true,
          possiblePieces: possiblePromotions,
          from,
          to,
          color: possiblePromotionMoves[0].color,
        });
      } else {
        performMove({ from, to });
      }
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
        <Grid templateColumns="600px 1fr" columnGap={3} alignItems="center">
          <GridItem w="600px" h="600px">
            <Chessboard ref={ref} onLoad={onLoad} onMove={onMove}></Chessboard>
            <ChessboardPromotion
              isOpen={promotionPrompt.isOpen}
              color={promotionPrompt.color}
              possiblePromotions={promotionPrompt.possiblePieces}
              onSelect={(selected) => {
                if (promotionPrompt.from !== null && promotionPrompt.to !== null) {
                  performMove({ from: promotionPrompt.from, to: promotionPrompt.to, promotion: selected });
                }
                setPromotionPrompt({
                  possiblePieces: [],
                  isOpen: false,
                  from: null,
                  to: null,
                  color: null,
                });
              }}
              onAbort={() => {
                ref.current?.setFen(engine.fen(), { movable: true });
                setPromotionPrompt({
                  possiblePieces: [],
                  isOpen: false,
                  from: null,
                  to: null,
                  color: null,
                });
              }}
            />
          </GridItem>
          <GridItem w={400}>
            <GamePanel
              config={{
                id,
                time: [5, 3],
                orientation,
              }}
              events={{
                playAsWhite: () => void 0,
                playAsBlack: () => void 0,
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
                turn: null, // state.isGameOver ? null : state.turn === 'w' ? 'white' : 'black',
                winner: null,
              }}
              players={{
                white: {
                  nick: 'TestUser#1236',
                  online: true,
                  timeLeft: 65 * 1e3,
                  lastTurnTs: Date.now(),
                },
                // black: {
                //   nick: 'TestPlayer#1539',
                //   online: false,
                //   timeLeft: 5 * 1e3,
                //   lastTurnTs: Date.now(),
                // },
                black: null,
              }}
            />
          </GridItem>
        </Grid>
      </Center>
    </>
  );
};
