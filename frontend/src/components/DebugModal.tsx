import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import type { Chess } from 'chess.js';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export const getEngineState = (fen: string, engine: Chess) => {
  return {
    fen,
    history: engine.history().join(' '),
    turn: engine.turn(),
    isCheck: engine.isCheck(),
    inCheck: engine.inCheck(),
    isCheckmate: engine.isCheckmate(),
    isStalemate: engine.isStalemate(),
    isInsufficientMaterial: engine.isInsufficientMaterial(),
    isThreefoldRepetition: engine.isThreefoldRepetition(),
    isDraw: engine.isDraw(),
    isGameOver: engine.isGameOver(),
  };
};

export type DebugModalProps = {
  data: unknown;
  isOpen: boolean;
  onClose: () => void;
};

export const DebugModal = ({ data, isOpen, onClose }: DebugModalProps) => {
  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Debug informations</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SyntaxHighlighter style={monokai} language="json">
            {JSON.stringify(data, undefined, 2).toString()}
          </SyntaxHighlighter>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
