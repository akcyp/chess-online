import './index.css';

import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { WebsocketProvider } from './contexts/WebsocketContext';
import { BasicLayout } from './layouts/BasicLayout';
import { NotFoundPage } from './pages/404';
import { AboutPage } from './pages/About';
import { CreateGamePage } from './pages/CreateGame';
import { GamePage, loader as gameLoader } from './pages/Game';
import { LobbyPage } from './pages/Lobby';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <WebsocketProvider>
        <BasicLayout />
      </WebsocketProvider>
    ),
    children: [
      {
        path: '/',
        element: <LobbyPage />,
      },
      {
        loader: gameLoader,
        path: '/game/:id',
        element: <GamePage />,
      },
      {
        path: '/about',
        element: <AboutPage />,
      },
      {
        path: '/play/public',
        element: <CreateGamePage type="public" />,
      },
      {
        path: '/play/private',
        element: <CreateGamePage type="private" />,
      },
    ],
    errorElement: <NotFoundPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>,
);
