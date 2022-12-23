import { combineDTOValidators } from '../utils/combineDTOValidators.ts';

import { LobbyAction } from './lobby/Lobby.dto.ts';
import { CreateGameAction } from './lobby/LobbyCreateGame.dto.ts';

import { GameAction } from './game/Game.dto.ts';
import { GamePlayAction } from './game/GamePlay.dto.ts';
import { GameMoveAction } from './game/GameMove.dto.ts';
import { GameOfferDrawAction } from './game/GameOfferDraw.dto.ts';
import { GameResignAction } from './game/GameResign.dto.ts';
import { GameRematchAction } from './game/GameRematch.dto.ts';
import { GameReadyAction } from './game/GameReady.dto.ts';

export const lobbyPayloadValidator = combineDTOValidators(LobbyAction, {
  createGame: CreateGameAction,
});

export type lobbyClientMessages = CreateGameAction;

export const gamePayloadValidator = combineDTOValidators(GameAction, {
  play: GamePlayAction,
  ready: GameReadyAction,
  move: GameMoveAction,
  offerdraw: GameOfferDrawAction,
  resign: GameResignAction,
  rematch: GameRematchAction,
});

export type gameClientMessages =
  | GamePlayAction
  | GameReadyAction
  | GameMoveAction
  | GameOfferDrawAction
  | GameResignAction
  | GameRematchAction;
