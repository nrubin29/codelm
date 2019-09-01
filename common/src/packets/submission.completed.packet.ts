import {Packet} from "./packet";

export class SubmissionCompletedPacket extends Packet {

  constructor(public _id: string) {
    super('submissionCompleted');
  }
}
