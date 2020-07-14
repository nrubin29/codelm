import { ClientPacket } from './client.packet';
import { ServerPacket } from './server.packet';
import { CodeRunnerPacket } from './coderunner.packet';

export interface UnexpectedDataPacket {
  name: 'unexpectedData';
  data: string;
}

export type Packet =
  | UnexpectedDataPacket
  | ClientPacket
  | ServerPacket
  | CodeRunnerPacket;
