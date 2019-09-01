import mongoose = require('mongoose');
import { isGradedProblem, ProblemModel, TestCaseOutputMode } from '../../../common/src/models/problem.model';
import { ProblemUtil } from '../../../common/src/utils/problem.util';
import { DivisionDao } from './division.dao';

type ProblemType = ProblemModel & mongoose.Document;

const ProblemDivisionSchema = new mongoose.Schema({
  division: {type: mongoose.Schema.Types.ObjectId, ref: 'Division'},
  problemNumber: Number,
  points: Number
});

const TestCaseSchema = new mongoose.Schema({
  hidden: Boolean,
  input: String,
  output: String
});

const Problem = mongoose.model<ProblemType>('Problem', new mongoose.Schema({
  title: String,
  description: String,
  type: String,
  game: String,
  extras: Object,
  divisions: [ProblemDivisionSchema],
  testCaseOutputMode: {type: String, default: TestCaseOutputMode.CaseSensitive},
  testCases: [TestCaseSchema]
}));

export function sanitizeProblem(problem: ProblemModel): ProblemModel {
  if (isGradedProblem(problem)) {
    problem.testCases = problem.testCases.filter(testCase => !testCase.hidden);
  }

  return problem;
}

export class ProblemDao {
  static getProblem(id: string): Promise<ProblemModel> {
    return Problem.findById(id).populate('divisions.division').exec();
  }

  static async getProblemsForDivision(divisionId: string): Promise<ProblemModel[]> {
    const division = await DivisionDao.getDivision(divisionId);
    const problems = await Problem.find({'divisions.division': divisionId}).populate('divisions.division').exec();
    return problems.sort((a: ProblemModel, b: ProblemModel) => ProblemUtil.getProblemNumberForDivision(a, division) - ProblemUtil.getProblemNumberForDivision(b, division));
  }

  static addOrUpdateProblem(problem: ProblemModel): Promise<ProblemModel> {
    if (!problem._id) {
      return Problem.create(problem);
    }

    else {
      return Problem.findByIdAndUpdate(problem._id, problem, {new: true}).exec();
    }
  }

  static deleteProblem(id: string): Promise<any> {
    return Problem.deleteOne({_id: id}).exec();
  }
}
