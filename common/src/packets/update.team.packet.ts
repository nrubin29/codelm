import { Packet } from './packet';

export class UpdateTeamPacket extends Packet {
  constructor() {
    super('updateTeam');
  }
}
