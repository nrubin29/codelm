import * as mongoose from 'mongoose';
import {
  isGradedProblem,
  ProblemModel,
} from '@codelm/common/src/models/problem.model';
import { ProblemUtil } from '@codelm/common/src/utils/problem.util';
import { DivisionDao } from './division.dao';
import { QueryPopulateOptions } from 'mongoose';
import { ModelDocument } from './dao';

type ProblemDocument = ModelDocument<ProblemModel>;

const ProblemDivisionSchema = new mongoose.Schema({
  division: { type: mongoose.Schema.Types.ObjectId, ref: 'Division' },
  problemNumber: Number,
  points: Number,
});

const VariableSchema = new mongoose.Schema({
  name: String,
  type: String,
});

const TestCaseSchema = new mongoose.Schema({
  hidden: Boolean,
  input: String,
  output: String,
  explanation: { type: String, default: undefined },
});

const Problem = mongoose.model<ProblemDocument>(
  'Problem',
  new mongoose.Schema({
    title: String,
    description: String,
    type: String,
    game: String,
    extras: Object,
    divisions: [ProblemDivisionSchema],
    variables: [VariableSchema],
    returnType: String,
    testCases: [TestCaseSchema],
  })
);

export function sanitizeProblem(problem: ProblemModel): ProblemModel {
  if (isGradedProblem(problem)) {
    problem.testCases = problem.testCases.filter(testCase => !testCase.hidden);
  }

  return problem;
}

export class ProblemDao {
  private static readonly populationPaths: QueryPopulateOptions[] = [
    { path: 'divisions', populate: { path: 'division' } },
  ];

  static getProblem(id: string): Promise<ProblemModel> {
    return Problem.findById(id)
      .lean()
      .populate(ProblemDao.populationPaths)
      .exec();
  }

  static async getProblemsForDivision(
    divisionId: string
  ): Promise<ProblemModel[]> {
    const division = await DivisionDao.getDivision(divisionId);
    const problems = await Problem.find({ 'divisions.division': divisionId })
      .lean()
      .populate(ProblemDao.populationPaths)
      .exec();

    for (const problem of problems) {
      try {
        ProblemUtil.getProblemNumberForDivision(problem, division);
      } catch (e) {
        console.log(problem);
      }
    }

    return problems.sort(
      (a, b) =>
        ProblemUtil.getProblemNumberForDivision(a, division) -
        ProblemUtil.getProblemNumberForDivision(b, division)
    );
  }

  static async addOrUpdateProblem(
    problem: ProblemModel
  ): Promise<ProblemModel> {
    if (!problem._id) {
      return (await Problem.create(problem)).toObject();
    } else {
      return await Problem.findByIdAndUpdate(problem._id, problem, {
        new: true,
      })
        .lean()
        .populate(ProblemDao.populationPaths)
        .exec();
    }
  }

  static deleteProblem(id: string): Promise<any> {
    return Problem.deleteOne({ _id: id }).exec();
  }
}
