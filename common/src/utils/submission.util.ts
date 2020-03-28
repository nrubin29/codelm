import { isGradedProblem, ProblemModel } from '../models/problem.model';
import {isGradedSubmission, SubmissionModel} from '../models/submission.model';

export class SubmissionUtil {
  static getSolution(problem: ProblemModel, submissions: SubmissionModel[]): SubmissionModel {
    submissions = submissions.filter(submission => submission.problem._id === problem._id);
    let solved;

    if (isGradedProblem(problem)) {
      // TODO: Is it safe to assume that points > 0 means success?
      solved = submissions.filter(submission => submission.points > 0);
    }

    else {
      solved = submissions.filter(submission => !submission.test);
    }

    if (solved.length > 0) {
      return solved[0];
    }

    return null;
  }

  static hasError(submission: SubmissionModel): boolean {
    if (submission.compilationError) {
      return true;
    }

    else if (isGradedSubmission(submission)) {
      return submission.testCases.find(testCase => testCase.error !== undefined) !== undefined;
    }

    return false;
  }
}

// TODO: Replace with Object#fromEntries once IT becomes available.
export function objectFromEntries<T>(map: Map<string, T>): {[key: string]: T} {
  return Object.assign({}, ...Array.from(map.entries()).map(([key, value]) => ({[key]: value})));
}
