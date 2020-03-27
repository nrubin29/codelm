import {Action} from "../action";
import {Tester} from "../tester";
import {VERSION} from "../../../common/version";
import {PROBLEM_SUBMISSIONS} from "../data";
import {SubmissionCompletedPacket, SubmissionStatusPacket} from "../../../common/src/packets/server.packet";

export class SubmitAction extends Action {
    runAction(tester: Tester) {
        return new Promise<any>(resolve => {
            const problemSubmission = PROBLEM_SUBMISSIONS.basketball.python;

            tester.on<SubmissionStatusPacket>('submissionStatus', packet => {
                console.log(packet.status);
            });

            tester.once<SubmissionCompletedPacket>('submissionCompleted', packet => {
                tester.off('submissionStatus');
                console.log("Submission finished! id =", packet.submission._id);
                resolve();
            });

            tester.emit({name: 'submission', submission: problemSubmission, team: tester.team, version: VERSION});
        });
    }
}
