import { Box, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { parseTimerString } from '../../helpers/parseTimerToString';

export type PlayerTimerProps = {
  milis: number;
  auto?: boolean;
  timerStartTs: number;
};

export const PlayerTimer = ({ milis, auto = true, timerStartTs }: PlayerTimerProps) => {
  const [miliseconds, setMiliseconds] = useState(milis - (auto ? Date.now() - timerStartTs : 0));
  const extended = miliseconds <= 5e3;
  const panic = miliseconds <= 5e3;

  useEffect(() => {
    setMiliseconds(milis - (auto ? Date.now() - timerStartTs : 0));
    if (!auto) {
      return;
    }
    const interval = setInterval(() => {
      setMiliseconds(milis - (Date.now() - timerStartTs));
    }, 100);
    return () => {
      clearInterval(interval);
    };
  }, [milis, timerStartTs, auto]);

  return (
    <Box
      boxShadow="xl"
      p={[1, 2]}
      bg={panic ? 'red.400' : 'blackAlpha.700'}
      w={[75, 150]}
      color="white"
      textAlign="center"
    >
      <Text fontSize={['xl', '3xl']}>{parseTimerString(miliseconds, extended)}</Text>
    </Box>
  );
};
