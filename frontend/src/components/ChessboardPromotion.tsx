import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import type { PieceSymbol } from 'chess.js';
import styled from 'styled-components';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const Piece = styled('piece')`
  width: 100% !important;
  height: 100% !important;
`;

export type ChessboardPromotionProps = {
  possiblePromotions: PieceSymbol[];
  color: null | 'w' | 'b';
  isOpen: boolean;
  onSelect: (selected: PieceSymbol) => void;
  onAbort: () => void;
};

export const ChessboardPromotion = ({
  possiblePromotions,
  color,
  isOpen,
  onSelect,
  onAbort,
}: ChessboardPromotionProps) => {
  const colorClassName = color === 'w' ? 'white' : 'black';
  const getPieceClass = (piece: PieceSymbol) =>
    ({
      q: 'queen',
      k: 'king',
      p: 'pawn',
      r: 'rook',
      b: 'bishop',
      n: 'knight',
    }[piece]);
  return (
    <Modal size="xl" isOpen={isOpen} closeOnEsc={false} onClose={onAbort} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select piece to promote</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <HStack className="cg-wrap" justifyContent="center">
            {possiblePromotions.sort().map((piece) => (
              <Button onClick={() => onSelect(piece)} key={piece} size="lg">
                <Piece className={`${colorClassName} ${getPieceClass(piece)}`} />
              </Button>
            ))}
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
