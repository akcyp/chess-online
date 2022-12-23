import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebsocketContext, useWSCachedMessage } from 'src/contexts/WebsocketContext';

const fractionLetters = ['¼', '½', '¾', '1', '1¼', '1½', '1¾'];

const minutesSteps = [
  ...Array.from({ length: 7 }, (_, i) => 0.25 * (i + 1)),
  ...Array.from({ length: 19 }, (_, i) => i + 2),
  ...Array.from({ length: 5 }, (_, i) => 25 + i * 5),
  ...Array.from({ length: 9 }, (_, i) => 60 + i * 15),
];
const incrementSteps = [
  ...Array.from({ length: 21 }, (_, i) => i),
  ...Array.from({ length: 5 }, (_, i) => 25 + i * 5),
  ...Array.from({ length: 5 }, (_, i) => 60 + i * 30),
];

export type CreateGameProps = {
  type: 'public' | 'private';
};

export const CreateGamePage = ({ type }: CreateGameProps) => {
  const navigate = useNavigate();
  const { send } = useWebsocketContext();
  const gameCreatedEvent = useWSCachedMessage('gameCreated');

  const [pendingRequest, setPendingRequest] = useState(false);

  const onCreate = useCallback(() => {
    setPendingRequest(true);
    send({
      type: 'createGame',
      minutes: minutesPerSideStep,
      increment: incrementStep,
      private: type === 'private',
    });
  }, []);

  useEffect(() => {
    if (gameCreatedEvent) {
      if (gameCreatedEvent.error) {
        window.alert(gameCreatedEvent.error);
        setPendingRequest(false);
      } else if (gameCreatedEvent.id) {
        navigate(`/game/${gameCreatedEvent.id}`);
      }
    }
  }, [gameCreatedEvent]);

  const [minutesPerSideStep, setMinutesPerSideStep] = useState(10);
  const [incrementStep, setIncrementStep] = useState(0);

  return (
    <Center h="70vh">
      <VStack boxShadow="xl" w={500}>
        <Text fontSize="lg" mb={4}>
          Creating {type} game
        </Text>
        <Box bg="blackAlpha.100" px={8} py={6} w="100%">
          <FormControl>
            <FormLabel fontWeight="normal" textAlign="center">
              Minutes per side:{' '}
              {minutesPerSideStep <= 6 ? fractionLetters[minutesPerSideStep] : minutesSteps[minutesPerSideStep]}
            </FormLabel>
            <Slider
              value={minutesPerSideStep}
              min={0}
              max={minutesSteps.length - 1}
              step={1}
              onChange={(value) => setMinutesPerSideStep(value)}
            >
              <SliderTrack bg="blackAlpha.100">
                <Box position="relative" right={10} />
                <SliderFilledTrack bg="blue" />
              </SliderTrack>
              <SliderThumb boxSize={6} />
            </Slider>
          </FormControl>
          <FormControl>
            <FormLabel fontWeight="normal" textAlign="center">
              Increment in seconds: {incrementSteps[incrementStep]}
            </FormLabel>
            <Slider
              value={incrementStep}
              min={0}
              max={incrementSteps.length - 1}
              step={1}
              onChange={(value) => setIncrementStep(value)}
            >
              <SliderTrack bg="blackAlpha.100">
                <Box position="relative" right={10} />
                <SliderFilledTrack bg="blue" />
              </SliderTrack>
              <SliderThumb boxSize={6} />
            </Slider>
          </FormControl>
        </Box>
        <Box pb={2}>
          <Button colorScheme="green" onClick={onCreate} disabled={pendingRequest}>
            Play!
          </Button>
        </Box>
      </VStack>
    </Center>
  );
};
