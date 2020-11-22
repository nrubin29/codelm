import { SettingsState } from '../models/settings.model';
import { SubmissionModel } from '../models/submission.model';
import { GameExtras } from '../models/game.model';

export interface ConnectResponsePacket {
  name: 'connectResponse';
  success: boolean;
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
  | ConnectResponsePacket
  | StateSwitchPacket
  | SubmissionCompletedPacket
  | GameExtrasPacket
  | SubmissionStatusPacket
  | UpdateSettingsPacket
  | UpdateTeamPacket;
