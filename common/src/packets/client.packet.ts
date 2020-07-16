import { Packet } from './packet';
import {
  ClientProblemSubmission,
  ClientReplayRequest,
} from '../problem-submission';
import { TeamModel } from '../models/team.model';

interface IClientPacket {
  version: string;
}

export interface LoginPacket extends IClientPacket {
  name: 'login';
  username: string;
  password: string;
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

export type ClientPacket = LoginPacket | ReplayPacket | SubmissionPacket;

export function isClientPacket(packet: Packet): packet is ClientPacket {
  return (packet as ClientPacket).version !== undefined;
}
