import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';

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
