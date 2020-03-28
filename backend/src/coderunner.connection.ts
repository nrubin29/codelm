import {ChildProcessWithoutNullStreams, spawn} from "child_process";
import {TestCaseModel} from "../../common/src/models/problem.model";
import {TestCaseSubmissionModel} from "../../common/src/models/submission.model";
import {ServerProblemSubmission} from "../../common/src/problem-submission";
import {
    CodeRunnerPacket,
    DockerKilledReason,
    CompilationResultPacket, DockerKilledPacket, GameOutputPacket,
    RunTestCaseResultPacket
} from '../../common/src/packets/coderunner.packet';
import {StdioPacketManager} from "../../common/src/packet.manager";
import {Game} from './games/game';
import {Observable} from 'rxjs';

const dockerArgs = [
    'run',
    '-i',             // Keep stdin open
    '--rm',           // Delete container after exit
    '--cap-drop=ALL', // Remove all capabilities
    '--net=none',     // Disable networking
    '--memory=256M',  // Cap memory at 256 MB
    '--cpus=1.0',     // Cap number of CPUs at 1
    'coderunner'
];

// TODO: Rename this class.
export class CodeRunnerConnection extends StdioPacketManager {
    private handle: ChildProcessWithoutNullStreams;

    constructor() {
        const handle = spawn('docker', dockerArgs);
        super(handle.stdout, handle.stdin);
        this.handle = handle;

        this.handle.on('exit', async code => {
            if (code !== 0) {
                this.onData(JSON.stringify({
                    name: 'dockerKilled',
                    reason: code === 1 ? DockerKilledReason.Timeout : code === 137 ? DockerKilledReason.Resources : DockerKilledReason.Other,
                } as DockerKilledPacket));
            }
        });
    }

    compile(serverProblemSubmission: ServerProblemSubmission): Promise<CompilationResultPacket> {
        return new Promise<CompilationResultPacket>((resolve, reject) => {
            this.once<CompilationResultPacket>('compilationResult', packet => {
                this.off('dockerKilled');
                resolve(packet);
            });

            this.once<DockerKilledPacket>('dockerKilled', packet => {
                this.off('compilationResult');
                reject(packet);
            });

            this.emit({name: 'serverProblemSubmission', serverProblemSubmission});
        });
    }

    runTestCase(testCase: TestCaseModel): Promise<TestCaseSubmissionModel> {
        return new Promise<TestCaseSubmissionModel>((resolve, reject) => {
            this.once<RunTestCaseResultPacket>('runTestCaseResult', packet => {
                this.off('dockerKilled');
                resolve(packet.testCase);
            });

            this.once<DockerKilledPacket>('dockerKilled', packet => {
                this.off('runTestCaseResult');
                reject(packet);
            });

            this.emit({name: 'runTestCase', testCase});
        });
    }

    runGame(game: Game): Observable<CodeRunnerPacket> {
        return new Observable<CodeRunnerPacket>(subscriber => {
            this.on<GameOutputPacket>('gameOutput', packet => {

                const result = game.onInput(packet.output);

                if (game.isFinished()) {
                  // this.output.next({input: game.getResult(), output: guess});
                  // resolve(game.getResult());
                    subscriber.complete();
                }

                else {
                  if (typeof result === 'string') {
                      subscriber.next({name: 'gameTurn', input: result, output: packet.output});
                      this.emit({name: 'gameOutput', output: result});
                  }

                  else {
                    // reject({error: result.error});
                  }
                }
            });

            this.once<DockerKilledPacket>('dockerKilled', packet => {
                this.off('gameOutput');
                subscriber.error(packet);
                subscriber.complete();
            });

            this.emit({name: 'runGame'});
        });
    }

    kill() {
        this.handle.kill('SIGKILL');
    }
}
