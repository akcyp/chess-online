import { CheckIcon, CloseIcon, UpDownIcon } from '@chakra-ui/icons';
import { Badge, Box, Flex, HStack, IconButton, Tooltip } from '@chakra-ui/react';
import { useMemo } from 'react';
import { BsArrowRepeat, BsDiamondHalf, BsDoorClosed } from 'react-icons/bs';

import { parseGameTimeConfig } from '../../helpers/parseGameTimeConfig';
import { PlayerBox, PlayerBoxEmpty } from './PlayerBox';
import { PlayerTimer } from './PlayerTimer';

type GamePanelPlayerProps = {
  nick: string;
  online: boolean;
  timeLeft: number;
  timerStartTs: number;
  isYou: boolean;
};

type TimeControl = {
  minutes: number;
  increment: number;
};

export type GamePanelProps = {
  events: {
    askForStart: () => void;
    playAsWhite: () => void;
    playAsBlack: () => void;
    exitPlay: () => void;
    toggleOrientation: () => void;
    offerDraw: () => void;
    resign: () => void;
    offerRematch: () => void;
    exit: () => void;
  };
  config: {
    id: string;
    time: TimeControl;
    orientation: 'white' | 'black';
  };
  players: {
    white: GamePanelPlayerProps | null;
    black: GamePanelPlayerProps | null;
  };
  game: {
    readyToPlay: boolean;
    rematchOffered: boolean;
    gameStarted: boolean;
    gameOver: boolean;
    turn: null | 'white' | 'black';
    winner: null | 'white' | 'black' | 'draw';
  };
};

const converTimeToTs = (time: TimeControl) => time.minutes * 6e4;

export const GamePanel = ({ events, config, players, game }: GamePanelProps) => {
  const whitePlayerBox = useMemo(
    () =>
      players.white ? (
        <PlayerBox
          nick={players.white.nick}
          online={players.white.online}
          onExit={events.exitPlay}
          exitIconVisible={players.white.isYou && (!game.gameStarted || game.gameOver)}
        />
      ) : (
        <PlayerBoxEmpty color="white" onClick={events.playAsWhite} />
      ),
    [players.white, events, game],
  );

  const blackPlayerBox = useMemo(
    () =>
      players.black ? (
        <PlayerBox
          nick={players.black.nick}
          online={players.black.online}
          onExit={events.exitPlay}
          exitIconVisible={players.black.isYou && (!game.gameStarted || game.gameOver)}
        />
      ) : (
        <PlayerBoxEmpty color="black" onClick={events.playAsBlack} />
      ),
    [players.black, events, game],
  );

  const whiteTimer = useMemo(() => {
    return (
      <PlayerTimer
        milis={players.white?.timeLeft ?? converTimeToTs(config.time)}
        auto={players.white !== null && game.turn === 'white' && game.gameStarted && !game.gameOver}
        timerStartTs={players.white?.timerStartTs ?? Date.now()}
      />
    );
  }, [players, game, config]);

  const blackTimer = useMemo(
    () => (
      <PlayerTimer
        milis={players.black?.timeLeft ?? converTimeToTs(config.time)}
        auto={players.black !== null && game.turn === 'black' && game.gameStarted && !game.gameOver}
        timerStartTs={players.black?.timerStartTs ?? Date.now()}
      />
    ),
    [players, game, config],
  );

  return (
    <Flex direction="column">
      {config.orientation === 'white' ? blackTimer : whiteTimer}
      <Box shadow="xl">
        {config.orientation === 'white' ? blackPlayerBox : whitePlayerBox}
        <Box textAlign="center" mt={2}>
          <Badge colorScheme="purple" fontSize="xl">
            Game: #{config.id}
          </Badge>
        </Box>
        <Box textAlign="center">
          <Badge colorScheme="purple">{parseGameTimeConfig(config.time)}</Badge>
        </Box>
        {game.winner && (
          <Box textAlign="center" mt={2}>
            <Badge colorScheme="red" fontSize="xl">
              {game.winner} {game.winner === 'draw' ? '' : 'won!'}
            </Badge>
          </Box>
        )}
        <HStack justifyContent="center" p={2}>
          {!game.gameStarted ? (
            <>
              <Tooltip label="I'm ready">
                <IconButton
                  colorScheme={game.readyToPlay ? 'green' : 'gray'}
                  icon={<CheckIcon />}
                  aria-label="I'm ready"
                  onClick={events.askForStart}
                ></IconButton>
              </Tooltip>
            </>
          ) : !game.gameOver ? (
            <>
              <Tooltip label="Toggle orientation">
                <IconButton
                  colorScheme="blue"
                  icon={<UpDownIcon />}
                  aria-label="Toggle orientation"
                  onClick={events.toggleOrientation}
                ></IconButton>
              </Tooltip>
              <Tooltip label="Offer a draw">
                <IconButton
                  colorScheme="orange"
                  icon={<BsDiamondHalf />}
                  aria-label="Offer a draw"
                  onClick={events.offerDraw}
                ></IconButton>
              </Tooltip>
              <Tooltip label="Resign">
                <IconButton
                  colorScheme="red"
                  icon={<CloseIcon />}
                  aria-label="Resign"
                  onClick={events.resign}
                ></IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip label="Toggle orientation">
                <IconButton
                  colorScheme="blue"
                  icon={<UpDownIcon />}
                  aria-label="Toggle orientation"
                  onClick={events.toggleOrientation}
                ></IconButton>
              </Tooltip>
              <Tooltip label="Play again">
                <IconButton
                  colorScheme={game.rematchOffered ? 'green' : 'orange'}
                  icon={<BsArrowRepeat />}
                  aria-label="Play again"
                  onClick={events.offerRematch}
                ></IconButton>
              </Tooltip>
              <Tooltip label="Exit">
                <IconButton
                  colorScheme="red"
                  icon={<BsDoorClosed />}
                  aria-label="Exit"
                  onClick={events.exit}
                ></IconButton>
              </Tooltip>
            </>
          )}
        </HStack>
        {config.orientation === 'white' ? whitePlayerBox : blackPlayerBox}
      </Box>
      {config.orientation === 'white' ? whiteTimer : blackTimer}
    </Flex>
  );
};
