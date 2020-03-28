import {isClientPacket, LoginPacket, RegisterPacket, ReplayPacket, SubmissionPacket} from '../../common/src/packets/client.packet';
import {sanitizeTeam, TeamDao} from './daos/team.dao';
import {AdminDao} from './daos/admin.dao';
import {Packet} from '../../common/src/packets/packet';
import {PermissionsUtil} from './permissions.util';
import {LoginResponse, SubmissionStatus} from '../../common/src/packets/server.packet';
import {VERSION} from '../../common/version';
import {ServerProblemSubmission} from '../../common/src/problem-submission';
import {ProblemDao} from './daos/problem.dao';
import {isGradedProblem, isOpenEndedProblem, OpenEndedProblemModel, ProblemType} from '../../common/src/models/problem.model';
import {isFalse, isTestCaseSubmissionCorrect, SubmissionDao, submissionResult} from './daos/submission.dao';
import {
  GradedSubmissionModel,
  isGradedSubmission,
  SubmissionModel,
  TestCaseSubmissionModel
} from '../../common/src/models/submission.model';
import * as WebSocket from 'ws';
import {Express} from 'express';
import {WithWebsocketMethod} from 'express-ws';
import {CodeRunnerConnection} from './coderunner.connection';
import {GameType} from '../../common/src/models/game.model';
import {Timesweeper} from './games/timesweeper';
import {HighLow} from './games/high-low';
import {CodeRunnerPacket} from '../../common/src/packets/coderunner.packet';
import {Observable} from 'rxjs';

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
      serverProblemSubmission.gameType = problem.gameType;
      serverProblemSubmission.problemExtras = problem.extras;
    }

    const {testCases, compilationError} = await this.runSubmission(serverProblemSubmission, socket);

    let submission: SubmissionModel = {
      type: isGradedProblem(problem) ? 'graded' : 'upload',
      team: packet.team,
      problem,
      language: problemSubmission.language,
      code: problemSubmission.code,
      testCases: testCases ?? [],
      compilationError,
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

    const problem = submission.problem as OpenEndedProblemModel;
    serverProblemSubmission.gameType = problem.gameType;
    serverProblemSubmission.problemExtras = problem.extras;

    await this.runSubmission(serverProblemSubmission, socket);
    this.emitToSocket({name: 'submissionCompleted', submission}, socket);
  }

  private async runGradedSubmission(serverProblemSubmission: ServerProblemSubmission, connection: CodeRunnerConnection): Promise<{testCases: TestCaseSubmissionModel[]}> {
    const testCases: TestCaseSubmissionModel[] = [];

    for (let testCase of serverProblemSubmission.testCases) {
      let testCaseSubmission: TestCaseSubmissionModel;

      try {
        testCaseSubmission = await connection.runTestCase(testCase);
      }

      catch (e) {
        connection.kill();

        if (e.name === 'dockerKilled') {
          testCaseSubmission = {
            hidden: testCase.hidden,
            input: testCase.input,
            output: '',
            correctOutput: testCase.output,
            error: e.reason,
          };
        }

        else {
          throw e;
        }
      }

      testCases.push(testCaseSubmission);

      if (testCaseSubmission.error) {
        // Stop running test cases if a test case gives an error.
        connection.kill();
        return {testCases};
      }
    }

    connection.kill();
    return {testCases};
  }

  private runOpenEndedSubmission(serverProblemSubmission: ServerProblemSubmission, connection: CodeRunnerConnection, socket: WebSocket): Promise<{}> {
    return new Promise<{}>(resolve => {
      let packetStream: Observable<CodeRunnerPacket>;

      switch (serverProblemSubmission.gameType) {
        case GameType.HighLow: {
          packetStream = connection.runGame(new HighLow());
          break;
        }
        case GameType.Timesweeper: {
          packetStream = connection.runGame(new Timesweeper(serverProblemSubmission.problemExtras));
          break;
        }
      }

      packetStream.subscribe(
        value => {
          this.emitToSocket(value, socket);
        },
        error => {
            this.emitToSocket(error, socket);
        },
        () => {
          resolve({});
        }
      );
    });
  }

  private async runSubmission(serverProblemSubmission: ServerProblemSubmission, socket: WebSocket): Promise<{testCases?: TestCaseSubmissionModel[], compilationError?: string}> {
    this.emitToSocket({name: 'submissionExtras', extras: serverProblemSubmission.problemExtras}, socket);

    const connection = new CodeRunnerConnection();

    try {
      this.emitToSocket({name: 'submissionStatus', status: SubmissionStatus.Compiling}, socket);
      const compilationResult = await connection.compile(serverProblemSubmission);

      if (!compilationResult.success) {
        connection.kill();
        return {compilationError: compilationResult.error};
      }
    }

    catch (e) {
      connection.kill();

      if (e.name === 'dockerKilled') {
        return {compilationError: 'Your code could not compile. Maybe the server is overloaded?'};
      }

      else {
        throw e;
      }
    }

    this.emitToSocket({name: 'submissionStatus', status: SubmissionStatus.Running}, socket);

    if (serverProblemSubmission.type === ProblemType.Graded) {
      return await this.runGradedSubmission(serverProblemSubmission, connection);
    }

    else {
      return await this.runOpenEndedSubmission(serverProblemSubmission, connection, socket);
    }
  }
}
