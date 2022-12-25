import { Box } from '@chakra-ui/react';
import { Navbar } from '@components/Navbar';
import { Outlet, useLoaderData } from 'react-router-dom';

import { ReadyState, useWebsocketContext } from '../contexts/WebsocketContext';

type BasicLayoutProps = {
  children?: JSX.Element | JSX.Element[];
  username?: string;
};

export const BasicLayout = ({ children, username }: BasicLayoutProps) => {
  const auth = username ? { username } : (useLoaderData() as { auth: { username: string } }).auth;
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
      <Navbar statusColor={statusColor} username={auth.username} />
      <Box padding={[2, 6]}>{children ? children : <Outlet />}</Box>
    </>
  );
};
