import {Action} from "../action";
import {Tester} from "../tester";
import {VERSION} from "../../../common/version";
import {PROBLEM_SUBMISSIONS} from "../data";
import {SubmissionStatusPacket} from "../../../common/src/packets/submission.status.packet";
import {SubmissionCompletedPacket} from "../../../common/src/packets/submission.completed.packet";
import {SubmissionPacket} from "../../../common/src/packets/submission.packet";

export class SubmitAction extends Action {
    runAction(tester: Tester) {
        return new Promise<any>(resolve => {
            const problemSubmission = PROBLEM_SUBMISSIONS.basketball.python;

            tester.on<SubmissionStatusPacket>('submissionStatus', packet => {
                console.log(packet.status);
            });

            tester.once<SubmissionCompletedPacket>('submissionCompleted', packet => {
                tester.off('submissionStatus');
                console.log("Submission finished! id =", packet._id);
                resolve();
            });

            tester.emit(new SubmissionPacket(problemSubmission, tester.team, VERSION));
        });
    }
}
