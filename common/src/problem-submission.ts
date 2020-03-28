import {ProblemType, TestCaseModel} from './models/problem.model';
import {GameType} from "./models/game.model";

export interface ClientReplayRequest {
  _id: string;
}

export interface ClientProblemSubmission {
  problemId: string;
  language: string;
  code: string;
  test: boolean;
}

export interface ServerProblemSubmission {
  problemTitle: string;
  type: ProblemType;
  gameType?: GameType;
  problemExtras?: any;
  testCases?: TestCaseModel[];
  language: string;
  code: string;
}
