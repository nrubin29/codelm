import {Packet} from "./packet";

export class SubmissionStatusPacket extends Packet {

  constructor(public status: string) {
    super('submissionStatus');
  }
}
