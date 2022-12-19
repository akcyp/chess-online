import { Box, Button, Grid, GridItem, Image } from '@chakra-ui/react';
import { GamesTable } from '@components/GamesTable';
import { Link } from 'react-router-dom';

import Logo from '../assets/chess_logo.png';

export const LobbyPage = () => {
  return (
    <Grid
      h="80vh"
      gap={4}
      justifyItems="center"
      gridTemplateAreas={[
        // Mobile
        `"logo"
         "games"
         "stats"`,
        // Tablet
        `"games games logo"
         "games games stats"`,
        // Desktop
        `"games games games stats logo"`,
      ]}
    >
      <GridItem area="games" w="100%">
        <Box h="80vh">
          <GamesTable games={GAMES_LIST} />
        </Box>
      </GridItem>
      <GridItem area="stats">
        <Box>Players online: 0</Box>
        <Box>Games: {GAMES_LIST.length}</Box>
      </GridItem>
      <GridItem area="logo" w={['300px', '200px']}>
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
