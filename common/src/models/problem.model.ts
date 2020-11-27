import { DivisionModel } from './division.model';
import { GameType } from './game.model';
import { Variable } from '../codegen/models';

export interface ProblemDivision {
  _id?: string;
  division: DivisionModel;
  problemNumber: number;
  points: number;
}

export interface TestCaseModel {
  hidden: boolean;
  input: string;
  output: string;
  explanation?: string;
}

export enum TestCaseOutputMode {
  CaseSensitive = 'Case Sensitive',
  CaseInsensitive = 'Case Insensitive',
  Number = 'Number',
  Boolean = 'Boolean',
}

export enum ProblemType {
  Graded = 'Graded',
  OpenEnded = 'OpenEnded',
}

export interface ProblemModel {
  _id?: string;
  title: string;
  description: string;
  type: ProblemType;
  divisions: ProblemDivision[];
}

export interface GradedProblemModel extends ProblemModel {
  variables: Variable[];
  testCaseOutputMode: TestCaseOutputMode; // TODO: Determine test case output mode by return type.
  testCases: TestCaseModel[];
}

export function isGradedProblem(
  problem: ProblemModel
): problem is GradedProblemModel {
  return problem.type === ProblemType.Graded;
}

export interface OpenEndedProblemModel extends ProblemModel {
  gameType: GameType;
  extras?: any;
}

export function isOpenEndedProblem(
  problem: ProblemModel
): problem is OpenEndedProblemModel {
  return problem.type === ProblemType.OpenEnded;
}
