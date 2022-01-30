import { DivisionModel } from './division.model';
import { GameType } from './game.model';
import { Variable, VariableDimension, VariableType } from '../codegen/models';

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
  inputDisplay?: string;
  outputDisplay?: string;
}

export enum ProblemType {
  Graded = 'Graded',
  OpenEnded = 'OpenEnded',
}

export type ProblemModel  = GradedProblemModel | OpenEndedProblemModel;

interface BaseProblemModel {
  _id?: string;
  title: string;
  description: string;
  type: ProblemType;
  divisions: ProblemDivision[];
}

export interface GradedProblemModel extends BaseProblemModel {
  variables: Variable[];
  returnType: VariableType;
  returnDimension: VariableDimension;
  testCases: TestCaseModel[];
}

export function isGradedProblem(
  problem: ProblemModel
): problem is GradedProblemModel {
  return problem.type === ProblemType.Graded;
}

export interface OpenEndedProblemModel extends BaseProblemModel {
  gameType: GameType;
  extras?: any;
}

export function isOpenEndedProblem(
  problem: ProblemModel
): problem is OpenEndedProblemModel {
  return problem.type === ProblemType.OpenEnded;
}
