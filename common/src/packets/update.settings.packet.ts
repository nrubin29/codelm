import { Packet } from './packet';

export class UpdateSettingsPacket extends Packet {
  constructor() {
    super('updateSettings');
  }
}
