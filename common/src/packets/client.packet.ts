import { Packet } from './packet';

export class ClientPacket extends Packet {
  constructor(name: string, public version: string) {
    super(name);
  }
}

export function isClientPacket(packet: Packet): packet is ClientPacket {
  return (<ClientPacket> packet).version !== undefined;
}
