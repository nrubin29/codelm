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

export interface RegisterTeamData {
  username: string;
  password: string;
  members: string;
  division: string;
}

export interface RegisterPacket extends IClientPacket {
  name: 'register';
  teamData: RegisterTeamData;
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

export type ClientPacket =
  | LoginPacket
  | RegisterPacket
  | ReplayPacket
  | SubmissionPacket;

export function isClientPacket(packet: Packet): packet is ClientPacket {
  return (packet as ClientPacket).version !== undefined;
}
