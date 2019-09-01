import { ClientPacket } from './client.packet';
import {ClientProblemSubmission} from "../problem-submission";
import {TeamModel} from "../models/team.model";

export class SubmissionExtrasPacket extends ClientPacket {

  constructor(public extras: any, version: string) {
    super('submissionExtras', version);
  }
}
