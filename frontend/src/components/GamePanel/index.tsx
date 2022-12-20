import { CloseIcon, UpDownIcon } from '@chakra-ui/icons';
import { Badge, Box, Flex, HStack, IconButton, Tooltip } from '@chakra-ui/react';
import { useMemo } from 'react';
import { BsArrowRepeat, BsDiamondHalf, BsDoorClosed } from 'react-icons/bs';

import { parseGameTimeConfig } from '../../helpers/parseGameTimeConfig';
import { PlayerBox } from './PlayerBox';
import { PlayerTimer } from './PlayerTimer';

export type GamePanelProps = {
  events: {
    toggleOrientation: () => void;
    offerDraw: () => void;
    resign: () => void;
    offerRematch: () => void;
    exit: () => void;
  };
  config: {
    id: string;
    time: number[];
    orientation: 'white' | 'black';
  };
  players: {
    white: {
      nick: string;
      online: boolean;
      timeLeft: number;
      lastTurnTs: number;
    };
    black: {
      nick: string;
      online: boolean;
      timeLeft: number;
      lastTurnTs: number;
    };
  };
  game: {
    turn: 'white' | 'black';
    gameOver: boolean;
  };
};

export const GamePanel = ({ events, config, players, game }: GamePanelProps) => {
  const whitePlayerBox = useMemo(
    () => <PlayerBox nick={players.white.nick} online={players.white.online} />,
    [players.white],
  );
  const whiteTimer = useMemo(
    () => (
      <PlayerTimer milis={players.white.timeLeft} auto={game.turn === 'white'} lastTurnTs={players.white.lastTurnTs} />
    ),
    [players.white.timeLeft, game.turn],
  );
  const blackPlayerBox = useMemo(
    () => <PlayerBox nick={players.black.nick} online={players.black.online} />,
    [players.black],
  );
  const blackTimer = useMemo(
    () => (
      <PlayerTimer milis={players.black.timeLeft} auto={game.turn === 'black'} lastTurnTs={players.black.lastTurnTs} />
    ),
    [players.black.timeLeft, game.turn],
  );

  return (
    <Flex direction="column">
      {config.orientation === 'white' ? blackTimer : whiteTimer}
      <Box shadow="xl">
        {config.orientation === 'white' ? blackPlayerBox : whitePlayerBox}
        <Box textAlign="center">
          <Badge colorScheme="purple" fontSize="xl">
            Game: #{config.id}
          </Badge>
        </Box>
        <Box textAlign="center">
          <Badge colorScheme="purple">{parseGameTimeConfig(config.time)}</Badge>
        </Box>
        <HStack justifyContent="center" p={2}>
          {!game.gameOver ? (
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
                  colorScheme="orange"
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
