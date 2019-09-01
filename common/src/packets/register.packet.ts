import { ClientPacket } from './client.packet';

export class RegisterPacket extends ClientPacket {
  constructor(public teamData: RegisterTeamData, version: string) {
    super('register', version);
  }
}

export interface RegisterTeamData {
  username: string;
  password: string;
  members: string;
  division: string;
}
