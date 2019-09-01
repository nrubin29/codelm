import { DivisionModel } from './division.model';
import {Game} from "./game.model";

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
}

export enum TestCaseOutputMode {
  CaseSensitive = 'Case Sensitive',
  CaseInsensitive = 'Case Insensitive',
  Number = 'Number',
  Boolean = 'Boolean'
}

export enum ProblemType {
  Graded = 'Graded',
  OpenEnded = 'OpenEnded'
}

export interface ProblemModel {
  _id?: string;
  title: string;
  description: string;
  type: ProblemType;
  divisions: ProblemDivision[];
}

export interface GradedProblemModel extends ProblemModel {
  testCaseOutputMode: TestCaseOutputMode;
  testCases: TestCaseModel[];
}

export function isGradedProblem(problem: ProblemModel): problem is GradedProblemModel {
  return problem.type === ProblemType.Graded;
}

export interface OpenEndedProblemModel extends ProblemModel {
  game: Game;
  extras?: any;
}

export function isOpenEndedProblem(problem: ProblemModel): problem is OpenEndedProblemModel {
  return problem.type === ProblemType.OpenEnded;
}
