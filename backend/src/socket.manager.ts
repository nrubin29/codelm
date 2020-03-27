import {LoginPacket, RegisterPacket, ReplayPacket, SubmissionPacket} from '../../common/src/packets/client.packet';
import {sanitizeTeam, TeamDao} from './daos/team.dao';
import {AdminDao} from './daos/admin.dao';
import {Packet} from '../../common/src/packets/packet';
import {PermissionsUtil} from './permissions.util';
import {LoginResponse} from '../../common/src/packets/server.packet';
import {VERSION} from '../../common/version';
import {isClientPacket} from '../../common/src/packets/client.packet';
import {ServerProblemSubmission} from "../../common/src/problem-submission";
import {ProblemDao} from "./daos/problem.dao";
import {isGradedProblem, isOpenEndedProblem, ProblemModel} from "../../common/src/models/problem.model";
import {isFalse, isTestCaseSubmissionCorrect, SubmissionDao, submissionResult} from "./daos/submission.dao";
import {spawn} from "child_process";
import {
  GradedSubmissionModel, isGradedSubmission,
  SubmissionModel,
  TestCaseSubmissionModel
} from "../../common/src/models/submission.model";
import * as WebSocket from 'ws';
import {Express} from "express";
import {WithWebsocketMethod} from "express-ws";

export class SocketManager {
  private static _instance: SocketManager;

  teamSockets: Map<string, WebSocket>;
  adminSockets: Map<string, WebSocket>;

  static get instance(): SocketManager {
    if (!SocketManager._instance) {
      throw new Error('SocketManager has not been initialized.');
    }

    return SocketManager._instance;
  }

  public static init(app: Express) {
    if (SocketManager._instance) {
      throw new Error('SocketManager has already been initialized.');
    }

    SocketManager._instance = new SocketManager(app);
  }

  public emit(teamId: string, packet: Packet) {
    if (this.teamSockets.has(teamId)) {
      this.emitToSocket(packet, this.teamSockets.get(teamId))
    }
  }

  public emitToSocket(packet: Packet, socket: WebSocket) {
    if (socket.readyState !== WebSocket.OPEN) {
      console.error('Bad socket');
    }

    else {
      socket.send(JSON.stringify(packet));
    }
  }

  public emitToAll(packet: Packet) {
    this.teamSockets.forEach(socket => this.emitToSocket(packet, socket));
    this.adminSockets.forEach(socket => this.emitToSocket(packet, socket));
  }

  public kick(id: string) {
    if (this.teamSockets.has(id)) {
      this.teamSockets.get(id).close();
      this.teamSockets.delete(id);
    }

    if (this.adminSockets.has(id)) {
      this.adminSockets.get(id).close();
      this.adminSockets.delete(id);
    }
  }

  public kickTeams() {
    this.teamSockets.forEach(socket => socket.close());
    this.teamSockets.clear();
  }

  protected constructor(app: Express) {
    this.teamSockets = new Map<string, WebSocket>();
    this.adminSockets = new Map<string, WebSocket>();

    setInterval(() => {
      // This is apparently necessary to stop the random disconnecting.
      this.teamSockets.forEach((socket, id) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.ping();
        }

        else {
          // TODO: Maybe collect all of the ids to be deleted and then delete them afterwards.
          this.teamSockets.delete(id);
        }
      });

      this.adminSockets.forEach((socket, id) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.ping();
        }

        else {
          this.adminSockets.delete(id);
        }
      });
    }, 15 * 1000);

    (app as any as WithWebsocketMethod).ws('/', socket => {
      let _id: string;

      socket.onmessage = (data) => {
        const packet = JSON.parse(<string>data.data);

        if (isClientPacket(packet) && packet.version !== VERSION) {
          this.emitToSocket({name: 'loginResponse', response: LoginResponse.OutdatedClient}, socket);
          socket.close();
        }

        else {
          socket.listeners(packet.name).map(listener => listener(packet));
        }
      };

      socket.on('login', packet => this.onLoginPacket(packet as LoginPacket, socket).then(__id => _id = __id));
      socket.on('register', packet => this.onRegisterPacket(packet as RegisterPacket, socket).then(__id => _id = __id));
      socket.on('submission', packet => this.onSubmissionPacket(packet as SubmissionPacket, socket));
      socket.on('replay', packet => this.onReplayPacket(packet as ReplayPacket, socket));

      socket.onclose = event => {
        if (!event.wasClean) {
          console.error('Socket closed not clean', _id, event.code, event.reason);
        }

        if (_id) {
          this.teamSockets.delete(_id);
          this.adminSockets.delete(_id);
        }
      };
    });
  }

  onLoginPacket(loginPacket: LoginPacket, socket: WebSocket): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      TeamDao.login(loginPacket.username, loginPacket.password).then(team => {
        if (this.teamSockets.has(team._id.toString())) {
          this.emitToSocket({name: 'loginResponse', response: LoginResponse.AlreadyConnected}, socket);
          socket.close();
          reject();
        }

        else {
          PermissionsUtil.hasAccess(team).then(access => {
            const response = access ? LoginResponse.SuccessTeam : LoginResponse.Closed;
            this.emitToSocket({name: 'loginResponse', response, team: response === LoginResponse.SuccessTeam ? sanitizeTeam(team) : undefined}, socket);

            if (response === LoginResponse.SuccessTeam) {
              this.teamSockets.set(team._id.toString(), socket);
              resolve(team._id.toString());
            }

            else {
              socket.close();
              reject();
            }
          });
        }
      }).catch((response: LoginResponse | Error) => {
        if (response === LoginResponse.NotFound) {
          AdminDao.login(loginPacket.username, loginPacket.password).then(admin => {
            if (this.adminSockets.has(admin._id.toString())) {
              this.emitToSocket({name: 'loginResponse', response: LoginResponse.AlreadyConnected}, socket);
              socket.close();
              reject();
            }

            else {
              this.adminSockets.set(admin._id.toString(), socket);
              this.emitToSocket({name: 'loginResponse', response: LoginResponse.SuccessAdmin, admin}, socket);
              resolve(admin._id.toString());
            }
          }).catch((response: LoginResponse | Error) => {
            if ((response as any).stack !== undefined) {
              console.error(response);
              this.emitToSocket({name: 'loginResponse', response: LoginResponse.Error}, socket);
            }

            else {
              this.emitToSocket({name: 'loginResponse', response: response as LoginResponse}, socket);
            }

            socket.close();
            reject();
          });
        }

        else {
          if ((response as any).stack !== undefined) {
            console.error(response);
            this.emitToSocket({name: 'loginResponse', response: LoginResponse.Error}, socket);
          }

          else {
            this.emitToSocket({name: 'loginResponse', response: response as LoginResponse}, socket);
          }

          socket.close();
          reject();
        }
      });
    });
  }

  onRegisterPacket(packet: RegisterPacket, socket: WebSocket): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const registerPacket = packet as RegisterPacket;
      PermissionsUtil.canRegister().then(canRegister => {
        if (canRegister) {
          TeamDao.register(registerPacket.teamData).then(team => {
            this.emitToSocket({name: 'loginResponse', response: LoginResponse.SuccessTeam, team: sanitizeTeam(team)}, socket);
            this.teamSockets.set(team._id.toString(), socket);
            resolve(team._id);
          }).catch((response: LoginResponse | Error) => {
            if ((response as any).stack !== undefined) {
              console.error(response);
              this.emitToSocket({name: 'loginResponse', response: LoginResponse.Error}, socket);
            }

            else {
              this.emitToSocket({name: 'loginResponse', response: response as LoginResponse}, socket);
            }

            socket.close();
            reject();
          });
        }

        else {
          this.emitToSocket({name: 'loginResponse', response: LoginResponse.Closed}, socket);
          socket.close();
          reject();
        }
      });
    });
  }

  // TODO: Ensure that submissions are open (use PermissionsUtil).
  async onSubmissionPacket(packet: SubmissionPacket, socket: WebSocket) {
    const problemSubmission = packet.submission;
    const problem = await ProblemDao.getProblem(problemSubmission.problemId);

    const serverProblemSubmission: ServerProblemSubmission = {
      problemTitle: problem.title,
      type: problem.type,
      language: problemSubmission.language,
      code: problemSubmission.code
    };

    if (isGradedProblem(problem)) {
      serverProblemSubmission.testCases = problem.testCases.filter(testCase => isFalse(problemSubmission.test.toString()) || !testCase.hidden);
    }

    else if (isOpenEndedProblem(problem)) {
      serverProblemSubmission.game = problem.game;
      serverProblemSubmission.problemExtras = problem.extras;
    }

    const {testCases, err} = await this.runSubmission(serverProblemSubmission, problem, socket);

    let submission: SubmissionModel = {
      type: isGradedProblem(problem) ? 'graded' : 'upload',
      team: packet.team,
      problem,
      language: problemSubmission.language,
      code: problemSubmission.code,
      testCases,
      error: err,
      test: problemSubmission.test
    } as GradedSubmissionModel;

    if (problemSubmission.test) {
      submission.result = submissionResult(submission);

      if (isGradedSubmission(submission) && isGradedProblem(problem)) {
        for (let testCase of submission.testCases) {
          testCase.correct = isTestCaseSubmissionCorrect(testCase, problem);
        }
      }
    }

    else {
      submission = await SubmissionDao.addSubmission(submission);
    }

    this.emitToSocket({name: 'submissionCompleted', submission}, socket);
  }

  // TODO: Combine this with onSubmissionPacket
  async onReplayPacket(packet: ReplayPacket, socket: WebSocket) {
    const submission = await SubmissionDao.getSubmission(packet.replayRequest._id);

    const serverProblemSubmission: ServerProblemSubmission = {
      problemTitle: submission.problem.title,
      type: submission.problem.type,
      language: submission.language,
      code: submission.code
    };

    if (isGradedProblem(submission.problem)) {
      serverProblemSubmission.testCases = submission.problem.testCases.filter(testCase => isFalse(submission.test.toString()) || !testCase.hidden);
    }

    else if (isOpenEndedProblem(submission.problem)) {
      serverProblemSubmission.game = submission.problem.game;
      serverProblemSubmission.problemExtras = submission.problem.extras;
    }

    await this.runSubmission(serverProblemSubmission, submission.problem, socket);
    this.emitToSocket({name: 'submissionCompleted', submission}, socket);
  }

  private runSubmission(serverProblemSubmission: ServerProblemSubmission, problem: ProblemModel, socket: WebSocket): Promise<{testCases: TestCaseSubmissionModel[], err: string}> {
    return new Promise<{testCases: TestCaseSubmissionModel[], err: string}>(resolve => {
      this.emitToSocket({name: 'submissionExtras', extras: serverProblemSubmission.problemExtras}, socket);

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

      const process = spawn('docker', dockerArgs);
      const testCases: TestCaseSubmissionModel[] = [];
      const errors = [];

      process.stdout.on('data',  (data: Buffer) => {
        // Sometimes, two packets will be read at once. This ensures that they are treated separately.
        for (let packet of data.toString().split(/(?<=})\n/g)) {
          // Every packet ends with a \n, so the last element of the split will always be empty, and we want to skip it.
          if (!packet) {
            continue;
          }

          let obj;

          try {
            obj = JSON.parse(packet.trim());
          }

          catch (e) {
            obj = {error: 'An internal error occurred: invalid JSON packet'};
          }

          if (obj.hasOwnProperty('error')) {
            errors.push(obj['error']);

            if (!isGradedProblem(problem)) {
              this.emitToSocket({name: 'game', data: obj}, socket);
            }
          }

          else if (obj.hasOwnProperty('status')) {
            this.emitToSocket({name: 'submissionStatus', status: obj.status}, socket);
          }

          else if (obj.hasOwnProperty('testCase')) {
            testCases.push(obj['testCase']);
            this.emitToSocket({name: 'submissionStatus', status: 'test case completed'}, socket);
          }

          else if (isOpenEndedProblem(problem)) {
            this.emitToSocket({name: 'game', data: obj}, socket);
          }

          else {
            throw new Error('Unknown object from container: ' + JSON.stringify(obj));
          }
        }
      });

      process.stderr.on('data', (data: Buffer) => {
        // TODO: Can't throw an error here. Should log and reject().
        throw new Error(data.toString());
      });

      process.on('exit', async code => {
        let err = undefined;

        if (errors.length > 0) {
          err = errors.join('\n');
        }

        else if (code !== 0) {
          err = `Docker process exited with non-zero error code ${code}`;
        }

        resolve({testCases, err});
      });

      process.stdin.write(JSON.stringify(serverProblemSubmission) + '\n');
      process.stdin.end();
    });
  }
}
