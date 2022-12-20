import { ArrowRightIcon } from '@chakra-ui/icons';
import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

import { parseGameTimeConfig } from '../helpers/parseGameTimeConfig';

export type GameTableProps = {
  games: {
    id: number;
    player: string;
    time: number[];
  }[];
};

export const GamesTable = ({ games }: GameTableProps) => {
  const navigate = useNavigate();
  return (
    <TableContainer h="100%" overflowY="scroll" className="hideScrollbar">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th></Th>
            <Th>Player</Th>
            <Th>Time</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {games.map(({ id, player, time }) => (
            <Tr key={id}>
              <Td>#{id}</Td>
              <Td>{player} </Td>
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
