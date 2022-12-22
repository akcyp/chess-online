import { combineDTOValidators } from '../utils/combineDTOValidators.ts';

import { LobbyAction } from './lobby/Lobby.dto.ts';
import { CreateGameAction } from './lobbyActions/LobbyCreateGameAction.ts';

import { GameAction } from './game/Game.dto.ts';
import { GamePlayAction } from './game/GamePlay.dto.ts';
import { GameMoveAction } from './game/GameMove.dto.ts';
import { GameOfferDrawAction } from './game/GameOfferDraw.dto.ts';
import { GameResignAction } from './game/GameResign.dto.ts';
import { GameRematchAction } from './game/GameRematch.dto.ts';

export const lobbyPayloadValidator = combineDTOValidators(LobbyAction, {
  createGame: CreateGameAction,
});

export const gamePayloadValidator = combineDTOValidators(GameAction, {
  play: GamePlayAction,
  move: GameMoveAction,
  offerdraw: GameOfferDrawAction,
  resign: GameResignAction,
  rematch: GameRematchAction,
});
