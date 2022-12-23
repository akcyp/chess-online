import { Box, Button, Grid, GridItem, Image } from '@chakra-ui/react';
import { GamesTable } from '@components/GamesTable';
import { Link } from 'react-router-dom';

import Logo from '../assets/chess_logo.png';
import { useWSCachedMessage } from '../contexts/WebsocketContext';

export const LobbyPage = () => {
  const games = useWSCachedMessage('updateGames')?.games || [];
  const playersCount = useWSCachedMessage('updatePlayers')?.count || 0;

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
        // Tablet & Desktop
        `"games games logo"
         "games games stats"`,
      ]}
    >
      <GridItem area="games" w="100%">
        <Box h="80vh">
          <GamesTable games={games} />
        </Box>
      </GridItem>
      <GridItem area="stats">
        <Box>Players online: {playersCount}</Box>
        <Box>Games: {games.length}</Box>
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
