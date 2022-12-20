import { Box, Button, Circle, HStack, Text } from '@chakra-ui/react';

export type PlayerBoxProps = {
  nick: string;
  online: boolean;
};

export const PlayerBox = ({ nick, online }: PlayerBoxProps) => (
  <Box boxShadow="xs" p={2} bg="whiteAlpha.600">
    <HStack ml={4}>
      <Circle size="16px" bg={online ? 'green' : 'gray'} />
      <Text>{nick}</Text>
    </HStack>
  </Box>
);

export const PlayerBoxEmpty = ({ onClick, color }: { onClick: () => void; color: 'white' | 'black' }) => (
  <Button boxShadow="xs" w="100%" borderRadius={0} p={2} bg="blue.400" colorScheme="blue" onClick={onClick}>
    Play as {color}
  </Button>
);
