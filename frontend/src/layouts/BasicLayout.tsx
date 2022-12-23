import { Box } from '@chakra-ui/react';
import { Navbar } from '@components/Navbar';
import { Outlet } from 'react-router-dom';

import { ReadyState, useWebsocketContext } from '../contexts/WebsocketContext';

type BasicLayoutProps = {
  children?: JSX.Element | JSX.Element[];
};

export const BasicLayout = ({ children }: BasicLayoutProps) => {
  const { readyState } = useWebsocketContext();
  const statusColor = {
    [ReadyState.CLOSED]: 'red',
    [ReadyState.CLOSING]: 'orange',
    [ReadyState.CONNECTING]: 'yellow',
    [ReadyState.OPEN]: 'green',
    [ReadyState.UNINSTANTIATED]: 'gray',
  }[readyState];
  return (
    <>
      <Navbar statusColor={statusColor} />
      <Box padding={[2, 6]}>{children ? children : <Outlet />}</Box>
    </>
  );
};
