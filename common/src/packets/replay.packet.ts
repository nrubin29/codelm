import { ClientPacket } from './client.packet';
import {ClientProblemSubmission, ClientReplayRequest} from "../problem-submission";
import {TeamModel} from "../models/team.model";

export class ReplayPacket extends ClientPacket {

  constructor(public replayRequest: ClientReplayRequest, public team: TeamModel, version: string) {
    super('replay', version);
  }
}
