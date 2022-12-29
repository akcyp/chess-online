import { Box, Link, Text } from '@chakra-ui/react';

export const AboutPage = () => {
  return (
    <Box>
      <Box p={2}>
        <Text>Source code:</Text>
        <Link as="a" target="_blank" href="https://github.com/akcyp/chess-online">
          - https://github.com/akcyp/chess-online
        </Link>
      </Box>
    </Box>
  );
};
