import { Box, Button, Grid, GridItem, Image } from '@chakra-ui/react';
import { GamesTable } from '@components/GamesTable';
import { Link } from 'react-router-dom';

import Logo from '../assets/chess_logo.png';

export const LobbyPage = () => {
  return (
    <Grid h="200px" templateRows="repeat(2, 1fr)" templateColumns="repeat(5, 1fr)" gap={4}>
      <GridItem colSpan={3}>
        <Box height="80vh">
          <GamesTable games={GAMES_LIST} />
        </Box>
      </GridItem>
      <GridItem colSpan={1}>
        <Box>Players online: 0</Box>
        <Box>Games: {GAMES_LIST.length}</Box>
      </GridItem>
      <GridItem colSpan={1}>
        <Image src={Logo} alt="PF Chess" />
        <Button margin={1} w="100%" as={Link} to="/play/public">
          Create game
        </Button>
        <Button margin={1} w="100%" as={Link} to="/play/private">
          Play with your friend
        </Button>
      </GridItem>
    </Grid>
  );
};

const GAMES_LIST = [
  { id: 1, player: 'anonymous123', time: [5, 3] },
  ...Array.from({ length: 20 }, (_, i) => ({ id: i + 3, player: `testplayer${i}`, time: [10, 3] })),
];
