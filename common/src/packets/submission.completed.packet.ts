import {Packet} from "./packet";
import {SubmissionModel} from "../models/submission.model";

export class SubmissionCompletedPacket extends Packet {

  constructor(public submission: SubmissionModel) {
    super('submissionCompleted');
  }
}
