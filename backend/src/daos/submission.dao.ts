import * as mongoose from 'mongoose';
import { QueryPopulateOptions } from 'mongoose';
import {
  GradedSubmissionModel,
  GradedSubmissionModelSanitized,
  isGradedSubmission,
  SubmissionModel,
  SubmissionOverview,
  SubmissionOverviewProblems,
  SubmissionOverviewStatus,
  TestCaseSubmissionModel,
  UploadSubmissionModel,
} from '@codelm/common/src/models/submission.model';
import {
  GradedProblemModel,
  ProblemType,
} from '@codelm/common/src/models/problem.model';
import { SocketManager } from '../socket.manager';
import { ProblemUtil } from '@codelm/common/src/utils/problem.util';
import { TeamDao } from './team.dao';
import { ProblemDao } from './problem.dao';
import { SubmissionUtil } from '@codelm/common/src/utils/submission.util';
import {
  VariableDimension,
  VariableType,
} from '@codelm/common/src/codegen/models';

type SubmissionType = SubmissionModel & mongoose.Document;

const TestCaseSubmissionSchema = new mongoose.Schema(
  {
    hidden: Boolean,
    input: String,
    correctOutput: String,
    output: String,
    error: { type: String, default: undefined },
    inputDisplay: { type: String, required: false },
    outputDisplay: { type: String, required: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export function isTrue(str: string): boolean {
  return str === 'true' || str === 'True' || str === '1';
}

export function isFalse(str: string): boolean {
  return str === 'false' || str === 'False' || str === '0';
}

function isOutputCorrect(
  output: string,
  correctOutput: string,
  type: VariableType
) {
  switch (type) {
    case VariableType.STRING:
    case VariableType.CHARACTER: {
      return output === correctOutput;
    }
    case VariableType.FLOAT:
    case VariableType.INTEGER: {
      return (
        !isNaN(output as any) &&
        parseFloat(output).toFixed(5) === parseFloat(correctOutput).toFixed(5)
      );
    }
    case VariableType.BOOLEAN: {
      return (
        (isTrue(output) && isTrue(correctOutput)) ||
        (isFalse(output) && isFalse(correctOutput))
      );
    }
    default: {
      throw new Error(`No support for type ${type}`);
    }
  }
}

export function isTestCaseSubmissionCorrect(
  testCase: TestCaseSubmissionModel,
  problem: GradedProblemModel
): boolean {
  if (testCase.error || !testCase.output) {
    return false;
  }

  if (problem.returnDimension === VariableDimension.SCALAR) {
    return isOutputCorrect(
      testCase.output,
      testCase.correctOutput,
      problem.returnType
    );
  } else if (problem.returnDimension === VariableDimension.ONE) {
    const outputLines = testCase.output
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);
    const correctOutputLines = testCase.correctOutput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);

    if (outputLines.length !== correctOutputLines.length) {
      return false;
    }

    return outputLines.every((line, i) =>
      isOutputCorrect(line, correctOutputLines[i], problem.returnType)
    );
  } else {
    const outputCells = testCase.output
      .split('\n')
      .map(row => row.trim())
      .filter(row => row)
      .map(row =>
        row
          .split(' ')
          .map(cell => cell.trim())
          .filter(cell => cell)
      );

    const correctOutputCells = testCase.correctOutput
      .split('\n')
      .map(row => row.trim())
      .filter(row => row)
      .map(row =>
        row
          .split(' ')
          .map(cell => cell.trim())
          .filter(cell => cell)
      );

    if (
      outputCells.length !== correctOutputCells.length ||
      outputCells.some((row, i) => row.length !== correctOutputCells[i].length)
    ) {
      return false;
    }

    return outputCells.every((row, i) =>
      row.every((cell, j) =>
        isOutputCorrect(cell, correctOutputCells[i][j], problem.returnType)
      )
    );
  }
}

TestCaseSubmissionSchema.virtual('correct').get(function () {
  return isTestCaseSubmissionCorrect(this, this.parent().problem);
});

const SubmissionSchema = new mongoose.Schema(
  {
    type: String,
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    language: String,
    code: String,
    rubric: { type: Map, of: Number, default: () => new Map() },
    test: { type: Boolean, default: false },
    testCases: [TestCaseSubmissionSchema],
    compilationError: { type: String, default: undefined },
    overrideCorrect: { type: Boolean, default: false },
    datetime: { type: Date, default: Date.now },
    dispute: {
      open: Boolean,
      message: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export function sanitizeSubmission(
  submission: SubmissionModel
): SubmissionModel {
  if (isGradedSubmission(submission)) {
    submission.problem.testCases = submission.problem.testCases.filter(
      testCase => !testCase.hidden
    );

    if (submission.testCases) {
      (submission as GradedSubmissionModelSanitized).testCases = submission.testCases.map(
        testCase =>
          testCase.hidden
            ? { hidden: true, correct: testCase.correct }
            : testCase
      );
    }
  }

  return submission;
}

export function submissionResult(submission: SubmissionModel) {
  if (isGradedSubmission(submission)) {
    if (submission.overrideCorrect) {
      return 'Override correct';
    } else if (submission.compilationError) {
      return 'Compilation error';
    } else if (SubmissionUtil.hasError(submission)) {
      return 'Test case error';
    } else {
      return (
        (
          (submission.testCases.filter(testCase =>
            isTestCaseSubmissionCorrect(testCase, submission.problem)
          ).length /
            submission.testCases.length) *
          100
        ).toFixed(0) + '%'
      );
    }
  } else {
    return submission.test ? 'Test' : 'Submitted';
  }
}

SubmissionSchema.virtual('result').get(function () {
  return submissionResult(this);
});

SubmissionSchema.virtual('points').get(function () {
  if (isGradedSubmission(this)) {
    const submission = this as GradedSubmissionModel;

    if (submission.test) {
      return 0;
    } else if (submission.overrideCorrect) {
      return ProblemUtil.getPoints(submission.problem, submission.team);
    } else if (SubmissionUtil.hasError(submission)) {
      return 0;
    } else if (submission.testCases.every(testCase => testCase.correct)) {
      return ProblemUtil.getPoints(submission.problem, submission.team);
    } else {
      return 0;
    }
  } else {
    const submission = this as UploadSubmissionModel;
    return Array.from(submission.rubric.values()).reduce(
      (sum, current) => sum + current,
      0
    );
  }
});

const Submission = mongoose.model<SubmissionType>(
  'Submission',
  SubmissionSchema
);

export class SubmissionDao {
  private static readonly populationPaths: QueryPopulateOptions[] = [
    {
      path: 'problem',
      model: 'Problem',
      populate: { path: 'divisions.division', model: 'Division' },
    },
    {
      path: 'team',
      model: 'Team',
      populate: [
        { path: 'division', model: 'Division' },
        { path: 'members', model: 'Person' },
      ],
    },
  ];

  static getSubmissionRaw(id: string): Promise<SubmissionType | null> {
    return Submission.findById(id)
      .populate(SubmissionDao.populationPaths)
      .exec();
  }

  static async getSubmission(id: string): Promise<SubmissionModel> {
    return (
      await Submission.findById(id)
        .populate(SubmissionDao.populationPaths)
        .exec()
    ).toObject();
  }

  static async getSubmissionsForTeam(
    teamId: string
  ): Promise<SubmissionModel[]> {
    const submissions = await Submission.find({ team: teamId })
      .populate(SubmissionDao.populationPaths)
      .exec();
    return submissions.map(submission => submission.toObject());
  }

  static async getSubmissionsForTeamAndProblem(
    teamId: string,
    problemId: string
  ): Promise<SubmissionModel[]> {
    const submissions = await Submission.find({
      team: teamId,
      problem: problemId,
    })
      .populate(SubmissionDao.populationPaths)
      .exec();
    return submissions.map(submission => submission.toObject());
  }

  static async getSubmissionOverview(
    divisionId: string
  ): Promise<SubmissionOverview> {
    const result: SubmissionOverview = [];
    const teams = (await TeamDao.getTeamsForDivision(divisionId)).sort(
      (a, b) => b.score - a.score
    );
    const problems = await ProblemDao.getProblemsForDivision(divisionId);

    for (const team of teams) {
      const data: SubmissionOverviewProblems = {};
      const submissions = await SubmissionDao.getSubmissionsForTeam(team._id);

      for (const problem of problems) {
        // TODO: This number seems to be wrong sometimes. This could also affect status.
        let numSubmissions = 0;

        // Begin: determine status
        let status: SubmissionOverviewStatus;
        let error = false;

        for (let submission of submissions) {
          if (submission.problem._id.toString() !== problem._id.toString()) {
            continue;
          }

          numSubmissions++;

          if (submission.points > 0) {
            status = SubmissionOverviewStatus.Complete;
            break;
          } else if (
            submission.problem.type === ProblemType.OpenEnded &&
            !submission.test
          ) {
            status = SubmissionOverviewStatus.Complete;
            break;
          } else if (!submission.test) {
            error = true;
          }
        }

        if (!status) {
          status = error
            ? SubmissionOverviewStatus.Error
            : SubmissionOverviewStatus.None;
        }
        // End: determine status

        data[problem._id] = {
          numSubmissions,
          status,
        };
      }

      result.push({
        team,
        problems: data,
      });
    }

    return result;
  }

  static async getDisputedSubmissions(): Promise<SubmissionModel[]> {
    const submissions = await Submission.find({ 'dispute.open': true })
      .populate(SubmissionDao.populationPaths)
      .exec();
    return submissions.map(submission => submission.toObject());
  }

  static async getScoreForTeam(teamId: string): Promise<number> {
    // This is needed because if the score is calculated in team.dao, there is circular population.
    const submissions = await Submission.find({ team: teamId })
      .populate(SubmissionDao.populationPaths)
      .exec();
    return submissions.reduce(
      (previousValue: number, currentValue: SubmissionType) =>
        previousValue + (currentValue.toObject().points || 0),
      0
    );
  }

  static async addSubmission(
    submission: SubmissionModel
  ): Promise<SubmissionModel> {
    // For some reason, Submission#create doesn't populate the team and then the
    // points virtual gets messed up. Even manually populating it before calling
    // s.toObject() doesn't work.
    const s = await Submission.create(submission);

    SocketManager.instance.send(s.team._id.toString(), {
      name: 'updateTeam',
    });

    return await SubmissionDao.getSubmission(s._id.toString());
  }

  static async updateSubmission(
    id: string,
    submission: SubmissionModel
  ): Promise<SubmissionModel> {
    const subm = await Submission.findOneAndUpdate({ _id: id }, submission, {
      new: true,
    })
      .populate(SubmissionDao.populationPaths)
      .exec();
    SocketManager.instance.send(subm.team._id.toString(), {
      name: 'updateTeam',
    });
    return subm.toObject();
  }

  static async deleteSubmission(id: string): Promise<void> {
    const submission = await SubmissionDao.getSubmission(id);
    await Submission.deleteOne({ _id: id }).exec();
    SocketManager.instance.send(submission.team._id.toString(), {
      name: 'updateTeam',
    });
  }
}
