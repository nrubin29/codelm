export class Packet {
  constructor(public name: string) {
  }
}

export function isPacket<T extends Packet>(packet: Packet, name: string): packet is T {
  return packet.name === name;
}
