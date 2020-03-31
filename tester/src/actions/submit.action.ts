import {Action} from "../action";
import {Tester} from "../tester";
import {VERSION} from "../../../common/version";
import {PROBLEM_SUBMISSIONS} from "../data";
import {SubmissionCompletedPacket, SubmissionStatusPacket} from "../../../common/src/packets/server.packet";

export class SubmitAction extends Action {
    constructor() {
        super('submit');
    }

    run(tester: Tester) {
        return new Promise<SubmissionCompletedPacket>(resolve => {
            const problemSubmission = PROBLEM_SUBMISSIONS.basketball.python;

            tester.on<SubmissionStatusPacket>('submissionStatus', packet => {
                tester.log(packet.status);
            });

            tester.once<SubmissionCompletedPacket>('submissionCompleted', packet => {
                tester.off('submissionStatus');
                tester.log("Submission finished! result =", packet.submission.result);
                resolve(packet);
            });

            tester.emit({name: 'submission', submission: problemSubmission, team: tester.team, version: VERSION});
        });
    }
}
