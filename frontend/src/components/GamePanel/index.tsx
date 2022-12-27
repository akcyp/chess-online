import { CheckIcon, CloseIcon, UpDownIcon } from '@chakra-ui/icons';
import { Badge, Box, Flex, HStack, IconButton, Tooltip } from '@chakra-ui/react';
import { useMemo } from 'react';
import { BsArrowRepeat, BsDiamondHalf, BsDoorClosed } from 'react-icons/bs';
import { GameState } from 'src/types/GameState';

import { parseGameTimeConfig } from '../../helpers/parseGameTimeConfig';
import { PlayerBox, PlayerBoxEmpty } from './PlayerBox';
import { PlayerTimer } from './PlayerTimer';

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
    orientation: 'white' | 'black';
  };
  gameState: GameState;
};

const convertTimeToTs = (time: TimeControl) => time.minutes * 6e4;

export const GamePanel = ({ events, config, gameState }: GamePanelProps) => {
  const playAs = useMemo(() => {
    return gameState.players.black?.isYou ? 'black' : gameState.players.white?.isYou ? 'white' : null;
  }, [gameState.players]);

  const whitePlayerBox = useMemo(() => {
    const white = gameState.players.white;
    return white ? (
      <PlayerBox
        nick={white.nick}
        online={white.online}
        onExit={events.exitPlay}
        exitIconVisible={white.isYou && (!gameState.game.gameStarted || gameState.game.gameOver)}
      />
    ) : (
      <PlayerBoxEmpty color="white" onClick={events.playAsWhite} />
    );
  }, [gameState.players.white, gameState.game, events]);

  const blackPlayerBox = useMemo(() => {
    const black = gameState.players.black;
    return black ? (
      <PlayerBox
        nick={black.nick}
        online={black.online}
        onExit={events.exitPlay}
        exitIconVisible={black.isYou && (!gameState.game.gameStarted || gameState.game.gameOver)}
      />
    ) : (
      <PlayerBoxEmpty color="black" onClick={events.playAsBlack} />
    );
  }, [gameState.players.black, gameState.game, events]);

  const whiteTimer = useMemo(() => {
    const white = gameState.players.white;
    return white ? (
      <PlayerTimer
        milis={white.timeLeft}
        auto={gameState.game.turn === 'white' && gameState.game.gameStarted && !gameState.game.gameOver}
        timerStartTs={white.timerStartTs}
      />
    ) : (
      <PlayerTimer milis={convertTimeToTs(gameState.game.timeControl)} auto={false} timerStartTs={0} />
    );
  }, [gameState.game, gameState.players.white]);

  const blackTimer = useMemo(() => {
    const black = gameState.players.black;
    return black ? (
      <PlayerTimer
        milis={black.timeLeft}
        auto={gameState.game.turn === 'black' && gameState.game.gameStarted && !gameState.game.gameOver}
        timerStartTs={black.timerStartTs}
      />
    ) : (
      <PlayerTimer milis={convertTimeToTs(gameState.game.timeControl)} auto={false} timerStartTs={0} />
    );
  }, [gameState.game, gameState.players.black]);

  const winnerBox = useMemo(() => {
    return (
      gameState.game.winner && (
        <Box textAlign="center" mt={2}>
          <Badge colorScheme="red" fontSize="xl">
            {gameState.game.winner} {gameState.game.winner === 'draw' ? '' : 'won!'}
          </Badge>
        </Box>
      )
    );
  }, [gameState.game.winner]);

  const actionButtons = {
    toggleOrientation: (
      <Tooltip label="Toggle orientation">
        <IconButton
          colorScheme="blue"
          icon={<UpDownIcon />}
          aria-label="Toggle orientation"
          onClick={events.toggleOrientation}
        ></IconButton>
      </Tooltip>
    ),
    ready: (
      <Tooltip label="I'm ready">
        <IconButton
          colorScheme={gameState.game.readyToPlay ? 'green' : 'gray'}
          icon={<CheckIcon />}
          aria-label="I'm ready"
          onClick={events.askForStart}
        ></IconButton>
      </Tooltip>
    ),
    draw: (
      <Tooltip label={gameState.game.drawOffered ? 'Opponent offered draw' : 'Offer a draw'}>
        <IconButton
          colorScheme={gameState.game.drawOffered ? 'green' : 'orange'}
          icon={<BsDiamondHalf />}
          aria-label="Offer a draw"
          onClick={events.offerDraw}
        ></IconButton>
      </Tooltip>
    ),
    resign: (
      <Tooltip label="Resign">
        <IconButton colorScheme="red" icon={<CloseIcon />} aria-label="Resign" onClick={events.resign}></IconButton>
      </Tooltip>
    ),
    playAgain: (
      <Tooltip label="Play again">
        <IconButton
          colorScheme={gameState.game.rematchOffered ? 'green' : 'orange'}
          icon={<BsArrowRepeat />}
          aria-label="Play again"
          onClick={events.offerRematch}
        ></IconButton>
      </Tooltip>
    ),
    exit: (
      <Tooltip label="Exit">
        <IconButton colorScheme="red" icon={<BsDoorClosed />} aria-label="Exit" onClick={events.exit}></IconButton>
      </Tooltip>
    ),
  };

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
          <Badge colorScheme="purple">{parseGameTimeConfig(gameState.game.timeControl)}</Badge>
        </Box>
        {winnerBox}
        <HStack justifyContent="center" p={2}>
          {actionButtons.toggleOrientation}
          {playAs !== null && !gameState.game.gameStarted && <>{actionButtons.ready}</>}
          {playAs !== null && gameState.game.gameStarted && !gameState.game.gameOver && (
            <>
              {actionButtons.draw}
              {actionButtons.resign}
            </>
          )}
          {playAs !== null && gameState.game.gameStarted && gameState.game.gameOver && (
            <>
              {actionButtons.playAgain}
              {actionButtons.exit}
            </>
          )}
        </HStack>
        {config.orientation === 'white' ? whitePlayerBox : blackPlayerBox}
      </Box>
      {config.orientation === 'white' ? whiteTimer : blackTimer}
    </Flex>
  );
};
