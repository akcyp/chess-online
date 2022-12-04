import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Config } from 'chessground/config';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const BoardContainer = styled.div`
  width: 500px;
  height: 500px;
  display: table;
`;

export type ChessboardProps = {
  config?: Config;
  onLoad?: (api: Api) => void;
};

export function Chessboard({ config = {}, onLoad = () => void 0 }: ChessboardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<Api | null>(null);
  useEffect(() => {
    if (ref?.current && !board) {
      const api = Chessground(ref.current, {
        animation: { enabled: true, duration: 200 },
        ...config,
      } as Config);
      setBoard(api);
      onLoad(api);
    }
  }, [ref]);
  return <BoardContainer ref={ref} />;
}

export { Api, Config };
