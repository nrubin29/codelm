import { ClientPacket } from './client.packet';
import {ClientProblemSubmission} from "../problem-submission";
import {TeamModel} from "../models/team.model";

export class SubmissionPacket extends ClientPacket {

  constructor(public submission: ClientProblemSubmission, public team: TeamModel, version: string) {
    super('submission', version);
  }
}
