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

export type ChessboardPromotionState = {
  isOpen: boolean;
  color?: 'white' | 'black';
  from?: string;
  to?: string;
  possiblePromotions?: PieceSymbol[];
};

export type ChessboardPromotionAction =
  | {
      type: 'reset';
    }
  | {
      type: 'create';
      color: 'white' | 'black';
      from: string;
      to: string;
      possiblePromotions: PieceSymbol[];
    };

export const ChessboardPromotionReducer = (
  state: ChessboardPromotionState,
  action: ChessboardPromotionAction,
): ChessboardPromotionState => {
  switch (action.type) {
    case 'reset': {
      return {
        isOpen: false,
      };
    }
    case 'create': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type, ...rest } = action;
      return {
        isOpen: true,
        ...rest,
      };
    }
  }
};

export type ChessboardPromotionProps = {
  isOpen: boolean;
  possiblePromotions?: PieceSymbol[];
  color?: 'white' | 'black';
  onSelect: (selected: PieceSymbol) => void;
  onAbort: () => void;
};

const Piece = styled('div')`
  width: 100% !important;
  height: 100% !important;
  position: absolute;
  top: 0;
  left: 0;
`;

export const ChessboardPromotion = ({
  possiblePromotions = [],
  color = 'white',
  isOpen,
  onSelect,
  onAbort,
}: ChessboardPromotionProps) => {
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
          <HStack className="cg-wrap-extra" justifyContent="center">
            {possiblePromotions.sort().map((piece) => (
              <Button onClick={() => onSelect(piece)} key={piece} size="lg">
                <Piece className={`piece ${color} ${getPieceClass(piece)}`} />
              </Button>
            ))}
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
