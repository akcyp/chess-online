import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import { WSReceivedMessage } from '../types/WSReceivedMessage';
import { WSSendMessage } from '../types/WSSendMessage';

export { ReadyState };

const API_URL = 'localhost:3000';

export const WebsocketContext = createContext<{
  readyState: ReadyState;
  lastMessage: null | WSReceivedMessage;
  send: (message: WSSendMessage) => void;
}>({
  readyState: ReadyState.UNINSTANTIATED,
  lastMessage: null,
  send: () => void 0,
});

export const useWebsocketContext = () => useContext(WebsocketContext);

export const useWSCachedMessage = <T extends WSReceivedMessage['type'], R = WSReceivedMessage & { type: T }>(
  type: T,
): R | null => {
  const [lastReceiver, setLastReceived] = useState<R | null>(null);
  const { lastMessage } = useWebsocketContext();
  useEffect(() => {
    if (lastMessage !== null && lastMessage.type === type && lastReceiver !== lastMessage) {
      setLastReceived(lastMessage as R);
    }
  }, [lastMessage]);
  return lastReceiver;
};

export const WebsocketProvider = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  const location = useLocation();

  const socketNamespace = useMemo<'lobby' | `game/${string}`>(() => {
    const regResult = /^\/game\/(?<id>[A-Za-z\d]+)$/.exec(location.pathname);
    if (regResult !== null) {
      const id = regResult.groups?.id;
      return `game/${id}`;
    }
    return 'lobby';
  }, [location]);

  const {
    sendMessage,
    lastMessage: rawLastMessage,
    readyState,
  } = useWebSocket(`ws://${API_URL}/ws/${socketNamespace}`, {
    shouldReconnect: () => true,
  });

  const send = useCallback(
    (message: WSSendMessage) => {
      sendMessage(JSON.stringify(message));
    },
    [sendMessage],
  );

  const lastMessage: WSReceivedMessage | null = useMemo(() => {
    if (rawLastMessage === null) {
      return null;
    }
    try {
      return JSON.parse(rawLastMessage.data?.toString() || '') as WSReceivedMessage;
    } catch (_) {
      return null;
    }
  }, [rawLastMessage]);

  const ctx = {
    send,
    lastMessage,
    readyState,
  };

  return <WebsocketContext.Provider value={ctx}>{children}</WebsocketContext.Provider>;
};
