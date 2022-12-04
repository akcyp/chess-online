import './App.css';

import { ChakraProvider } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { useCallback, useState } from 'react';

import { Api, Chessboard } from './components/Chessboard';

function App() {
  const [board, setBoard] = useState<Api | undefined>();
  const toggleOrientation = useCallback(() => {
    board?.toggleOrientation();
  }, [board]);

  return (
    <ChakraProvider>
      <div>
        <Chessboard onLoad={setBoard}></Chessboard>
      </div>
      <Button onClick={toggleOrientation}>Toggle orientation</Button>
    </ChakraProvider>
  );
}

export default App;
