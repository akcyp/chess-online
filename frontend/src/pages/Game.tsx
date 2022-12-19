import { CloseIcon, MinusIcon, UpDownIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Center,
  Circle,
  Flex,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  useBoolean,
} from '@chakra-ui/react';
import { Chessboard, ChessboardActions } from '@components/Chessboard';
import { Chess } from 'chess.js';
import { useCallback, useRef, useState } from 'react';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { useKeyboard } from '../hooks/useKeyboard';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = params['id'] || '';
  console.log(id); // validate
  return { id };
};

const PlayerTimer = ({
  milis,
  extended = false,
  panic = false,
}: {
  milis: number;
  extended?: boolean;
  panic: boolean;
}) => {
  const minutes = Math.floor(milis / 1e3 / 60);
  const seconds = Math.floor((milis / 1e3) % 60);
  const miliseconds = milis % 1e3;
  const addZero = (val: number, d = 2) => val.toString().padStart(d, '0');
  return (
    <Box boxShadow="xl" p={4} bg={panic ? 'red.400' : 'blackAlpha.700'} w={150} color="white" textAlign="center">
      <Text fontSize="2xl">
        {extended
          ? `${addZero(minutes)}:${addZero(seconds)}:${addZero(miliseconds, 3)}`
          : `${addZero(minutes)}:${addZero(seconds)}`}
      </Text>
    </Box>
  );
};

const PlayerBox = ({ nick, online }: { nick: string; online: boolean }) => (
  <Box boxShadow="xs" p={2} bg="whiteAlpha.600">
    <HStack ml={4}>
      <Circle size="16px" bg={online ? 'green' : 'gray'} />
      <Text fontStyle="bold">{nick}</Text>
    </HStack>
  </Box>
);

export const GamePage = () => {
  const { id } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const ref = useRef<ChessboardActions>(null);
  const [engine] = useState(new Chess());
  const [fen, setFen] = useState(engine.fen());
  const [isDebugModalOpen, debugModal] = useBoolean(false);

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
      <Modal size="xl" isOpen={isDebugModalOpen} onClose={debugModal.off}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Debug informations</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SyntaxHighlighter style={monokai} language="json">
              {JSON.stringify(state, undefined, 2).toString()}
            </SyntaxHighlighter>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Center h="80vh">
        <Grid templateColumns="496px 1fr" alignItems="center">
          <GridItem w="496px">
            <Chessboard ref={ref} onLoad={onLoad} onMove={onMove}></Chessboard>
          </GridItem>
          <GridItem w={400}>
            <Flex direction="column">
              <PlayerTimer milis={(5 * 60 + 45) * 1e3} panic={false} />
              <Box shadow="xl">
                <PlayerBox nick="TestUser123" online={true} />
                <Box textAlign="center">
                  <Badge colorScheme="purple" fontSize="xl">
                    Game: #{id}
                  </Badge>
                </Box>
                <Box textAlign="center">
                  <Badge colorScheme="purple">5m + 3s</Badge>
                </Box>
                <HStack justifyContent="center" p={2}>
                  <Tooltip label="Toggle orientation">
                    <IconButton
                      colorScheme="blue"
                      icon={<UpDownIcon />}
                      aria-label="Toggle orientation"
                      onClick={toggleOrientation}
                    ></IconButton>
                  </Tooltip>
                  <Tooltip label="Offer a draw">
                    <IconButton colorScheme="orange" icon={<MinusIcon />} aria-label="Offer a draw"></IconButton>
                  </Tooltip>
                  <Tooltip label="Resign">
                    <IconButton colorScheme="red" icon={<CloseIcon />} aria-label="Resign"></IconButton>
                  </Tooltip>
                </HStack>
                <PlayerBox nick="TestPlayer123" online={false} />
              </Box>
              <PlayerTimer milis={5 * 1e3} panic={true} />
            </Flex>
          </GridItem>
        </Grid>
      </Center>
    </>
  );
};
