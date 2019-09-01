import { Packet } from './packet';
import { SettingsState } from '../models/settings.model';

export class StateSwitchPacket extends Packet {
  constructor(public newState: SettingsState) {
    super('stateSwitch');
  }
}
