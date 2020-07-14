import { TeamModel } from '../models/team.model';
import { AdminModel } from '../models/admin.model';
import { SettingsState } from '../models/settings.model';
import { SubmissionModel } from '../models/submission.model';
import { GameExtras } from '../models/game.model';

export const enum LoginResponse {
  SuccessTeam = 'Success Team',
  SuccessAdmin = 'Success Admin',
  IncorrectPassword = 'Incorrect Password',
  NotFound = 'Account not found',
  Closed = 'The dashboard is currently closed',
  AlreadyExists = 'An account with that username already exists',
  AlreadyConnected = 'This account is already logged in',
  OutdatedClient = 'Please refresh the page. If this error persists, clear your browser cache',
  Error = 'An internal error occurred.',
}

export interface LoginResponsePacket {
  name: 'loginResponse';
  response: LoginResponse;
  team?: TeamModel;
  admin?: AdminModel;
}

export interface StateSwitchPacket {
  name: 'stateSwitch';
  newState: SettingsState;
}

export interface SubmissionCompletedPacket {
  name: 'submissionCompleted';
  submission: SubmissionModel;
}

export interface GameExtrasPacket {
  name: 'submissionExtras';
  extras: GameExtras;
}

export enum SubmissionStatus {
  Compiling = 'Compiling',
  Running = 'Running',
}

export interface SubmissionStatusPacket {
  name: 'submissionStatus';
  status: SubmissionStatus;
}

export interface UpdateSettingsPacket {
  name: 'updateSettings';
}

export interface UpdateTeamPacket {
  name: 'updateTeam';
}

export type ServerPacket =
  | LoginResponsePacket
  | StateSwitchPacket
  | SubmissionCompletedPacket
  | GameExtrasPacket
  | SubmissionStatusPacket
  | UpdateSettingsPacket
  | UpdateTeamPacket;
