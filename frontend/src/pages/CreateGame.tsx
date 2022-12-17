import { Box } from '@chakra-ui/react';

export type CreateGameProps = {
  type: 'public' | 'private';
};

export const CreateGamePage = ({ type }: CreateGameProps) => {
  return <Box>Creating {type} game</Box>;
};
