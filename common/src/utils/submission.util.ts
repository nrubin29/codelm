import { isGradedProblem, ProblemModel } from '../models/problem.model';
import { SubmissionModel } from '../models/submission.model';

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
}
