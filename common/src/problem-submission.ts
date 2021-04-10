import { ProblemType, TestCaseModel } from './models/problem.model';
import { GameType } from './models/game.model';
import { LanguageName } from './language';

export interface ClientReplayRequest {
  _id: string;
}

export interface ClientProblemSubmission {
  problemId: string;
  language: LanguageName;
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
