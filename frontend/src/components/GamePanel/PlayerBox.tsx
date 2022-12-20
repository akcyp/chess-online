import { CloseIcon } from '@chakra-ui/icons';
import { Button, Circle, HStack, IconButton, Text } from '@chakra-ui/react';

export type PlayerBoxProps = {
  nick: string;
  online: boolean;
  exitIconVisible: boolean;
  onExit: () => void;
};

export const PlayerBox = ({ nick, online, exitIconVisible, onExit }: PlayerBoxProps) => (
  <HStack boxShadow="xs" p={2} bg="whiteAlpha.600" justifyContent="space-between">
    <HStack ml={4}>
      <Circle size="16px" bg={online ? 'green' : 'gray'} />
      <Text>{nick}</Text>
    </HStack>
    {exitIconVisible && (
      <IconButton size="xs" onClick={onExit} icon={<CloseIcon />} colorScheme="red" aria-label="Exit" />
    )}
  </HStack>
);

export const PlayerBoxEmpty = ({ onClick, color }: { onClick: () => void; color: 'white' | 'black' }) => (
  <Button boxShadow="xs" w="100%" borderRadius={0} p={2} bg="blue.400" colorScheme="blue" onClick={onClick}>
    Play as {color}
  </Button>
);
