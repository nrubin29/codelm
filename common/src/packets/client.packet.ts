import {
  ClientProblemSubmission,
  ClientReplayRequest,
} from '../problem-submission';
import { TeamModel } from '../models/team.model';

interface IClientPacket {
  version: string;
}

export interface ConnectPacket extends IClientPacket {
  name: 'connect';
  jwt: string;
}

export interface ReplayPacket extends IClientPacket {
  name: 'replay';
  replayRequest: ClientReplayRequest;
  team: TeamModel;
}

export interface SubmissionPacket extends IClientPacket {
  name: 'submission';
  submission: ClientProblemSubmission;
  team: TeamModel;
}

export type ClientPacket = ConnectPacket | ReplayPacket | SubmissionPacket;
