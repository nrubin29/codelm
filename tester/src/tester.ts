import * as WebSocket from 'ws';
import {LoginPacket} from "../../common/src/packets/login.packet";
import {VERSION} from "../../common/version";
import {LoginResponse, LoginResponsePacket} from "../../common/src/packets/login.response.packet";
import {SocketManager} from "../../common/src/socket-manager";
import {SubmissionStatusPacket} from "../../common/src/packets/submission.status.packet";
import {SubmissionCompletedPacket} from "../../common/src/packets/submission.completed.packet";
import {SubmissionPacket} from "../../common/src/packets/submission.packet";
import {PROBLEM_SUBMISSIONS} from "./data";
import {TeamModel} from "../../common/src/models/team.model";

export class Tester extends SocketManager<WebSocket> {
    constructor(private team: TeamModel) {
        super(() => new WebSocket('ws://localhost:8080'));
    }

    connect(): Promise<void> {
        return super.connect().then(() => new Promise<void>((resolve, reject) => {
            this.once<LoginResponsePacket>('loginResponse', packet => {
                if (packet.response === LoginResponse.SuccessTeam) {
                    resolve();
                }

                else {
                    reject(packet.response);
                }
            });

            this.emit(new LoginPacket(this.team.username, 'password', VERSION));
        }));
    }

    run() {
        const problemSubmission = PROBLEM_SUBMISSIONS.basketball.python;

        this.on<SubmissionStatusPacket>('submissionStatus', packet => {
            console.log(packet.status);
        });

        this.once<SubmissionCompletedPacket>('submissionCompleted', packet => {
            this.off('submissionStatus');
            console.log("Submission finished! id =", packet._id);
        });

        this.emit(new SubmissionPacket(problemSubmission, this.team, VERSION));
    }
}
