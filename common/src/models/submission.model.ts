import {
  GradedProblemModel,
  OpenEndedProblemModel,
  ProblemModel,
} from './problem.model';
import { TeamModel } from './team.model';

// Optional values are generated by Mongoose or MongoDB

export interface TestCaseSubmissionModel {
  hidden: boolean;
  input: string;
  output: string;
  correctOutput: string;
  inputDisplay?: string;
  error?: string;
  correct?: boolean;
}

// TODO: correctOutput and inputDisplay shouldn't be stored here; they should be
//  populated from the corresponding TestCaseModel. However, because
//  TestCaseModels aren't stored in their own collection, Mongoose's populate()
//  won't work here.

export interface DisputeModel {
  open: boolean;
  message: string;
}

export interface SubmissionModel {
  _id?: string;
  type: 'graded' | 'upload';
  team: TeamModel;
  problem: ProblemModel;
  compilationError?: string;
  result?: string;
  points?: number;
  datetime?: Date;
  language: string;
  code: string;
  test: boolean;
}

export interface GradedSubmissionModel extends SubmissionModel {
  type: 'graded';
  problem: GradedProblemModel;
  overrideCorrect?: boolean;
  dispute?: DisputeModel;
  testCases?: TestCaseSubmissionModel[];
}

export function isGradedSubmission(
  submission: SubmissionModel
): submission is GradedSubmissionModel {
  return submission.type === 'graded';
}

export interface UploadSubmissionModel extends SubmissionModel {
  type: 'upload';
  problem: OpenEndedProblemModel;
  rubric: Map<string, number>;
}

export function isUploadSubmission(
  submission: SubmissionModel
): submission is UploadSubmissionModel {
  return submission.type === 'upload';
}

export enum SubmissionOverviewStatus {
  Complete = 'Complete',
  Error = 'Error',
  None = 'None',
}

export type SubmissionOverview = SubmissionOverviewElement[];

export interface SubmissionOverviewElement {
  team: TeamModel;
  problems: SubmissionOverviewProblems;
}

export interface SubmissionOverviewProblems {
  [problemId: string]: {
    numSubmissions: number;
    status: SubmissionOverviewStatus;
  };
}
