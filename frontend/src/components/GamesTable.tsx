import { ArrowRightIcon } from '@chakra-ui/icons';
import { Hide, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

import { parseGameTimeConfig } from '../helpers/parseGameTimeConfig';

export type GameTableProps = {
  games: {
    id: string;
    player1: string;
    player2: string;
    time: {
      minutes: number;
      increment: number;
    };
  }[];
};

export const GamesTable = ({ games }: GameTableProps) => {
  const navigate = useNavigate();
  return (
    <TableContainer h="100%" overflowY="scroll" className="hideScrollbar">
      <Table variant="simple" size={['sm', 'sm', 'md']}>
        <Thead>
          <Tr>
            <Hide below="lg">
              <Th></Th>
            </Hide>
            <Th>Player1</Th>
            <Th>Player2</Th>
            <Th>Time</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {games.map(({ id, player1, player2, time }) => (
            <Tr key={id}>
              <Hide below="lg">
                <Td>#{id}</Td>
              </Hide>
              <Td>{player1}</Td>
              <Td>{player2}</Td>
              <Td>{parseGameTimeConfig(time)}</Td>
              <Td>
                <ArrowRightIcon cursor="pointer" onClick={() => navigate(`/game/${id}`)} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
