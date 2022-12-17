import { Box, ListItem, UnorderedList } from '@chakra-ui/react';

export const AboutPage = () => {
  return (
    <Box>
      <Box>Technology used:</Box>
      <UnorderedList marginLeft={5}>
        <ListItem>
          Frontend:
          <UnorderedList>
            <ListItem>react</ListItem>
            <ListItem>vite</ListItem>
            <ListItem>react-router-dom</ListItem>
            <ListItem>chakra UI</ListItem>
            <ListItem>chessground</ListItem>
          </UnorderedList>
        </ListItem>
        <ListItem>
          Backend:
          <UnorderedList>
            <ListItem>python</ListItem>
          </UnorderedList>
        </ListItem>
      </UnorderedList>
    </Box>
  );
};
