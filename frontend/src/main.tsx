import './index.css';

import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { BasicLayout } from './layouts/Basic/BasicLayout';
import { NotFound } from './pages/404/NotFound';
import { Game, loader as gameLoader } from './pages/Game/Game';
import { Lobby } from './pages/Lobby/Lobby';

const router = createBrowserRouter([
  {
    path: '/',
    element: <BasicLayout />,
    children: [
      {
        path: '/',
        element: <Lobby />,
      },
      {
        loader: gameLoader,
        path: '/game/:id',
        element: <Game />,
      },
    ],
    errorElement: <NotFound />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>,
);
