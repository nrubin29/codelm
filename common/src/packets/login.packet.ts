import { ClientPacket } from './client.packet';

export class LoginPacket extends ClientPacket {

  constructor(public username: string, public password: string, version: string) {
    super('login', version);
  }
}
