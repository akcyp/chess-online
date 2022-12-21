import { Box, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { parseTimerString } from '../../helpers/parseTimerToString';

export type PlayerTimerProps = {
  milis: number;
  auto?: boolean;
  lastTurnTs: number;
};

export const PlayerTimer = ({ milis, auto = true, lastTurnTs }: PlayerTimerProps) => {
  const [miliseconds, setMiliseconds] = useState(milis - (auto ? Date.now() - lastTurnTs : 0));
  const extended = miliseconds <= 5e3;
  const panic = miliseconds <= 5e3;

  useEffect(() => {
    setMiliseconds(milis - (auto ? Date.now() - lastTurnTs : 0));
    if (!auto) {
      return;
    }
    const interval = setInterval(() => {
      setMiliseconds(milis - (Date.now() - lastTurnTs));
    }, 10);
    return () => {
      clearInterval(interval);
    };
  }, [milis, lastTurnTs, auto]);

  return (
    <Box
      boxShadow="xl"
      p={[1, 2]}
      bg={panic ? 'red.400' : 'blackAlpha.700'}
      w={[70, 150]}
      color="white"
      textAlign="center"
    >
      <Text fontSize={['xl', '3xl']}>{parseTimerString(miliseconds, extended)}</Text>
    </Box>
  );
};
