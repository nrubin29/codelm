import {
  ConnectPacket,
  ReplayPacket,
  SubmissionPacket,
} from '@codelm/common/src/packets/client.packet';
import { Packet } from '@codelm/common/src/packets/packet';
import { SubmissionStatus } from '@codelm/common/src/packets/server.packet';
import { ServerProblemSubmission } from '@codelm/common/src/problem-submission';
import { ProblemDao } from './daos/problem.dao';
import {
  isGradedProblem,
  isOpenEndedProblem,
  OpenEndedProblemModel,
  ProblemType,
} from '@codelm/common/src/models/problem.model';
import {
  isFalse,
  isTestCaseSubmissionCorrect,
  SubmissionDao,
  submissionResult,
} from './daos/submission.dao';
import {
  GradedSubmissionModel,
  isGradedSubmission,
  SubmissionModel,
  TestCaseSubmissionModel,
} from '@codelm/common/src/models/submission.model';
import * as WebSocket from 'ws';
import { Express } from 'express';
import { WithWebsocketMethod } from 'express-ws';
import { CodeRunnerConnection } from './coderunner.connection';
import { GameType } from '@codelm/common/src/models/game.model';
import { Timesweeper } from './games/timesweeper';
import { HighLow } from './games/high-low';
import { CodeRunnerPacket } from '@codelm/common/src/packets/coderunner.packet';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { JWT_PRIVATE_KEY } from './server';
import { isTeamJwt, Jwt } from '../../common/src/models/auth.model';

class Socket {
  personId?: string;
  teamId?: string;
  adminId?: string;

  constructor(private webSocket: WebSocket, jwt: Jwt) {
    if (isTeamJwt(jwt)) {
      this.personId = jwt.personId;
      this.teamId = jwt.teamId;
    } else {
      this.adminId = jwt.adminId;
    }
  }

  get _id() {
    return this.teamId ?? this.adminId;
  }

  send(packet: Packet) {
    if (this.webSocket.readyState !== WebSocket.OPEN) {
      console.error('Bad socket');
    } else {
      this.webSocket.send(JSON.stringify(packet));
    }
  }

  ping() {
    if (this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.ping();
      return true;
    } else {
      return false;
    }
  }

  close() {
    this.webSocket.close();
  }
}

export class SocketManager {
  private static _instance: SocketManager;

  sockets: Socket[];

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

  public send(teamId: string, packet: Packet) {
    this.sockets
      .filter(socket => socket.teamId === teamId)
      .forEach(socket => {
        socket.send(packet);
      });
  }

  public sendToAll(packet: Packet) {
    this.sockets.forEach(socket => {
      socket.send(packet);
    });
  }

  public kick(id: string) {
    this.sockets = this.sockets.filter(socket => socket._id !== id);
  }

  public kickTeams() {
    this.sockets
      .filter(socket => socket.teamId)
      .forEach(socket => {
        socket.close();
      });

    this.sockets = this.sockets.filter(socket => !socket.teamId);
  }

  protected constructor(app: Express) {
    this.sockets = [];

    // Ping each connected socket every 15 seconds to keep them open.
    setInterval(() => {
      this.sockets = this.sockets.filter(socket => socket.ping());
    }, 15 * 1000);

    ((app as any) as WithWebsocketMethod).ws('/', webSocket => {
      let socket: Socket;

      webSocket.onmessage = data => {
        const packet = JSON.parse(data.data as string);
        webSocket.listeners(packet.name).forEach(listener => listener(packet));
      };

      webSocket.on('connect', packet => {
        this.onConnectPacket(packet as ConnectPacket, webSocket).then(
          _socket => {
            socket = _socket;
          }
        );
      });

      webSocket.on('submission', packet => {
        this.onSubmissionPacket(packet as SubmissionPacket, socket);
      });

      webSocket.on('replay', packet => {
        this.onReplayPacket(packet as ReplayPacket, socket);
      });

      webSocket.onclose = () => {
        if (socket) {
          this.sockets = this.sockets.filter(
            _socket => _socket._id !== socket._id
          );
        }
      };

      webSocket.onerror = event => {
        console.error(event.type, event.message, event.error);
      };
    });
  }

  onConnectPacket(
    packet: ConnectPacket,
    webSocket: WebSocket
  ): Promise<Socket> {
    return new Promise<Socket>((resolve, reject) => {
      jwt.verify(packet.jwt, JWT_PRIVATE_KEY, (err, decoded) => {
        if (err) {
          webSocket.send(
            JSON.stringify({ name: 'connectResponse', success: false })
          );
          webSocket.close();
          reject(err);
        } else {
          const socket = new Socket(webSocket, decoded as Jwt);
          this.sockets.push(socket);
          socket.send({ name: 'connectResponse', success: true });
          resolve(socket);
        }
      });
    });
  }

  // TODO: Ensure that submissions are open (use PermissionsUtil).
  async onSubmissionPacket(packet: SubmissionPacket, socket: Socket) {
    const problemSubmission = packet.submission;
    const problem = await ProblemDao.getProblem(problemSubmission.problemId);

    const serverProblemSubmission: ServerProblemSubmission = {
      problemTitle: problem.title,
      type: problem.type,
      language: problemSubmission.language,
      code: problemSubmission.code,
    };

    if (isGradedProblem(problem)) {
      serverProblemSubmission.testCases = problem.testCases.filter(
        testCase =>
          isFalse(problemSubmission.test.toString()) || !testCase.hidden
      );
    } else if (isOpenEndedProblem(problem)) {
      serverProblemSubmission.gameType = problem.gameType;
      serverProblemSubmission.problemExtras = problem.extras;
    }

    const { testCases, compilationError } = await this.runSubmission(
      serverProblemSubmission,
      socket
    );

    let submission: SubmissionModel = {
      type: isGradedProblem(problem) ? 'graded' : 'upload',
      team: packet.team,
      problem,
      language: problemSubmission.language,
      code: problemSubmission.code,
      testCases: testCases ?? [],
      compilationError,
      test: problemSubmission.test,
    } as GradedSubmissionModel;

    if (problemSubmission.test) {
      submission.result = submissionResult(submission);

      if (isGradedSubmission(submission) && isGradedProblem(problem)) {
        for (let testCase of submission.testCases) {
          testCase.correct = isTestCaseSubmissionCorrect(testCase, problem);
        }
      }
    } else {
      submission = await SubmissionDao.addSubmission(submission);
    }

    socket.send({ name: 'submissionCompleted', submission });
  }

  // TODO: Combine this with onSubmissionPacket
  async onReplayPacket(packet: ReplayPacket, socket: Socket) {
    const submission = await SubmissionDao.getSubmission(
      packet.replayRequest._id
    );

    const serverProblemSubmission: ServerProblemSubmission = {
      problemTitle: submission.problem.title,
      type: submission.problem.type,
      language: submission.language,
      code: submission.code,
    };

    const problem = submission.problem as OpenEndedProblemModel;
    serverProblemSubmission.gameType = problem.gameType;
    serverProblemSubmission.problemExtras = problem.extras;

    await this.runSubmission(serverProblemSubmission, socket);
    socket.send({ name: 'submissionCompleted', submission });
  }

  private async runGradedSubmission(
    serverProblemSubmission: ServerProblemSubmission,
    connection: CodeRunnerConnection
  ): Promise<{ testCases: TestCaseSubmissionModel[] }> {
    const testCases: TestCaseSubmissionModel[] = [];

    for (let testCase of serverProblemSubmission.testCases) {
      let testCaseSubmission: TestCaseSubmissionModel;

      try {
        testCaseSubmission = await connection.runTestCase(testCase);
      } catch (e) {
        connection.kill();

        testCaseSubmission = {
          hidden: testCase.hidden,
          input: testCase.input,
          output: '',
          correctOutput: testCase.output,
          inputDisplay: testCase.inputDisplay,
        };

        if (e.name === 'dockerKilled') {
          testCaseSubmission.error = e.reason;
        } else if (e.name === 'unexpectedData') {
          testCaseSubmission.error =
            'An unexpected error occurred. Maybe the server is overloaded? Please send the following error to a judge: ' +
            e.data;
        } else {
          testCaseSubmission.error =
            'An unknown error occurred. Please send the following error to a judge: ' +
            JSON.stringify(e);
        }
      }

      testCases.push(testCaseSubmission);

      if (testCaseSubmission.error) {
        // Stop running test cases if a test case gives an error.
        connection.kill();
        return { testCases };
      }
    }

    connection.kill();
    return { testCases };
  }

  private runOpenEndedSubmission(
    serverProblemSubmission: ServerProblemSubmission,
    connection: CodeRunnerConnection,
    socket: Socket
  ): Promise<{}> {
    return new Promise<{}>(resolve => {
      let packetStream: Observable<CodeRunnerPacket>;

      switch (serverProblemSubmission.gameType) {
        case GameType.HighLow: {
          packetStream = connection.runGame(new HighLow());
          break;
        }
        case GameType.Timesweeper: {
          packetStream = connection.runGame(
            new Timesweeper(serverProblemSubmission.problemExtras)
          );
          break;
        }
      }

      packetStream.subscribe(
        value => {
          socket.send(value);
        },
        error => {
          socket.send(error);
        },
        () => {
          resolve({});
        }
      );
    });
  }

  private async runSubmission(
    serverProblemSubmission: ServerProblemSubmission,
    socket: Socket
  ): Promise<{
    testCases?: TestCaseSubmissionModel[];
    compilationError?: string;
  }> {
    socket.send({
      name: 'submissionExtras',
      extras: serverProblemSubmission.problemExtras,
    });

    let connection: CodeRunnerConnection;

    try {
      connection = new CodeRunnerConnection();
    } catch (e) {
      return {
        compilationError:
          'The server is overloaded. Please send the following error to a judge: ' +
          JSON.stringify(e),
      };
    }

    try {
      socket.send({
        name: 'submissionStatus',
        status: SubmissionStatus.Compiling,
      });
      const compilationResult = await connection.compile(
        serverProblemSubmission
      );

      if (!compilationResult.success) {
        connection.kill();
        return { compilationError: compilationResult.error };
      }
    } catch (e) {
      connection.kill();

      if (e.name === 'dockerKilled') {
        return {
          compilationError:
            'Your code could not compile. Maybe the server is overloaded?',
        };
      } else if (e.name === 'unexpectedData') {
        return {
          compilationError:
            'An unexpected error occurred. Maybe the server is overloaded? Please send the following error to a judge: ' +
            e.data,
        };
      } else {
        return {
          compilationError:
            'An unknown occurred. Please send the following error to a judge: ' +
            JSON.stringify(e),
        };
      }
    }

    socket.send({ name: 'submissionStatus', status: SubmissionStatus.Running });

    if (serverProblemSubmission.type === ProblemType.Graded) {
      return await this.runGradedSubmission(
        serverProblemSubmission,
        connection
      );
    } else {
      return await this.runOpenEndedSubmission(
        serverProblemSubmission,
        connection,
        socket
      );
    }
  }
}
