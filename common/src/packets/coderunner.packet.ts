import { TestCaseSubmissionModel } from '../models/submission.model';
import { ServerProblemSubmission } from '../problem-submission';
import { TestCaseModel } from '../models/problem.model';

export interface ServerProblemSubmissionPacket {
  name: 'serverProblemSubmission';
  serverProblemSubmission: ServerProblemSubmission;
}

export interface CompilationResultPacket {
  name: 'compilationResult';
  success: boolean;
  error?: string;
}

export interface RunTestCasePacket {
  name: 'runTestCase';
  testCase: TestCaseModel;
}

export interface RunTestCaseResultPacket {
  name: 'runTestCaseResult';
  testCase: TestCaseSubmissionModel;
}

export interface RunGamePacket {
  name: 'runGame';
}

export interface GameOutputPacket {
  name: 'gameOutput';
  output: string;
}

export interface GameTurnPacket {
  name: 'gameTurn';
  input: string;
  output: string;
}

export enum DockerKilledReason {
  Timeout = 'Your code timed out.', // exit code 1
  Resources = 'Your code used too much RAM or CPU time.', // exit code 137
  Other = 'Your process exited with an unexpected non-zero exit code.',
}

export interface DockerKilledPacket {
  name: 'dockerKilled';
  reason: DockerKilledReason;
}

export type CodeRunnerPacket =
  | ServerProblemSubmissionPacket
  | CompilationResultPacket
  | RunTestCasePacket
  | RunTestCaseResultPacket
  | RunGamePacket
  | GameOutputPacket
  | GameTurnPacket
  | DockerKilledPacket;
