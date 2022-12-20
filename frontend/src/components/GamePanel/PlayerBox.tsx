import { Box, Circle, HStack, Text } from '@chakra-ui/react';

export type PlayerBoxProps = {
  nick: string;
  online: boolean;
};

export const PlayerBox = ({ nick, online }: PlayerBoxProps) => (
  <Box boxShadow="xs" p={2} bg="whiteAlpha.600">
    <HStack ml={4}>
      <Circle size="16px" bg={online ? 'green' : 'gray'} />
      <Text fontStyle="bold">{nick}</Text>
    </HStack>
  </Box>
);
