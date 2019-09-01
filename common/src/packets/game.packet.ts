import { Packet } from './packet';

export class GamePacket extends Packet {
  constructor(public data: object) {
    super('game');
  }
}
