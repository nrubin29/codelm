import mongoose = require('mongoose');
import {
  isGradedSubmission,
  SubmissionModel,
  TestCaseSubmissionModel
} from '../../../common/src/models/submission.model';
import {GradedProblemModel, ProblemType, TestCaseOutputMode} from '../../../common/src/models/problem.model';
import {ModelPopulateOptions} from 'mongoose';
import {SocketManager} from '../socket.manager';
import {UpdateTeamPacket} from '../../../common/src/packets/update.team.packet';
import {ProblemUtil} from '../../../common/src/utils/problem.util';
import {TeamModel} from "../../../common/src/models/team.model";
import {TeamDao} from "./team.dao";

type SubmissionType = SubmissionModel & mongoose.Document;

const TestCaseSubmissionSchema = new mongoose.Schema({
  hidden: Boolean,
  input: String,
  correctOutput: String,
  output: String
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export function isTrue(str: string): boolean {
  return str === 'true' || str === 'True' || str === '1';
}

export function isFalse(str: string): boolean {
  return str === 'false' || str === 'False' || str === '0';
}

function isTestCaseSubmissionCorrect(testCase: TestCaseSubmissionModel, problem: GradedProblemModel): boolean {
  if (!testCase.output) {
    return false;
  }

  switch (problem.testCaseOutputMode) {
    case TestCaseOutputMode.CaseSensitive: {
      return testCase.output === testCase.correctOutput;
    }
    case TestCaseOutputMode.CaseInsensitive: {
      return testCase.output.toLowerCase() === testCase.correctOutput.toLowerCase();
    }
    case TestCaseOutputMode.Number: {
      return parseFloat(testCase.output).toFixed(5) === parseFloat(testCase.correctOutput).toFixed(5);
    }
    case TestCaseOutputMode.Boolean: {
      return (isTrue(testCase.output) && isTrue(testCase.correctOutput)) || (isFalse(testCase.output) && isFalse(testCase.correctOutput));
    }
    default: {
      throw new Error(`No support for output mode ${problem.testCaseOutputMode}`);
    }
  }
}

TestCaseSubmissionSchema.virtual('correct').get(function() {
  return isTestCaseSubmissionCorrect(this, this.parent().problem);
});

const SubmissionSchema = new mongoose.Schema({
  type: String,
  team: {type: mongoose.Schema.Types.ObjectId, ref: 'Team'},
  problem: {type: mongoose.Schema.Types.ObjectId, ref: 'Problem'},
  language: String,
  code: String,
  score: Number,
  test: {type: Boolean, default: false},
  testCases: [TestCaseSubmissionSchema],
  error: String,
  overrideCorrect: {type: Boolean, default: false},
  datetime: {type: Date, default: Date.now},
  dispute: {
    open: Boolean,
    message: String
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export function sanitizeSubmission(submission: SubmissionModel): SubmissionModel {
  if (isGradedSubmission(submission)) {
    submission.problem.testCases = submission.problem.testCases.filter(testCase => !testCase.hidden);

    if (submission.testCases) {
      submission.testCases = submission.testCases.filter(testCase => !testCase.hidden);
    }
  }

  return submission;
}

SubmissionSchema.virtual('result').get(function() {
  if (this.overrideCorrect) {
    return 'Override correct';
  }

  else if (this.error) {
    return 'Error';
  }

  else if (this.problem.type === ProblemType.OpenEnded) {
    return this.test ? 'Test' : 'Submitted'
  }

  else {
    return ((this.testCases.filter(testCase => isTestCaseSubmissionCorrect(testCase, this.problem)).length / this.testCases.length) * 100).toFixed(0) + '%';
  }
});

SubmissionSchema.virtual('points').get(function() {
  if (isGradedSubmission(this)) {
    if (this.test) {
      return 0;
    }

    else if (this.overrideCorrect) {
      return ProblemUtil.getPoints(this.problem, this.team);
    }

    else if (this.error) {
      return 0;
    }

    else if (this.testCases.every(testCase => testCase.toObject().correct)) {
      return ProblemUtil.getPoints(this.problem, this.team);
    }

    else {
      return 0;
    }
  }

  else {
    // TODO: Take into account algorithm performance
    return this.score;
  }
});

const Submission = mongoose.model<SubmissionType>('Submission', SubmissionSchema);

export class SubmissionDao {
  private static readonly problemPopulationPath: ModelPopulateOptions = {path: 'problem', model: 'Problem', populate: {path: 'divisions.division', model: 'Division'}};
  private static readonly teamPopulationPath: ModelPopulateOptions = {path: 'team', model: 'Team', populate: {path: 'division', model: 'Division'}};

  static getSubmissionRaw(id: string): Promise<SubmissionType | null> {
    return Submission.findById(id).populate(SubmissionDao.problemPopulationPath).populate(SubmissionDao.teamPopulationPath).exec();
  }

  static async getSubmission(id: string): Promise<SubmissionModel> {
    return (await Submission.findById(id).populate(SubmissionDao.problemPopulationPath).populate(SubmissionDao.teamPopulationPath).exec()).toObject();
  }

  static async getSubmissionsForTeam(teamId: string): Promise<SubmissionModel[]> {
    const submissions = await Submission.find({team: teamId}).populate(SubmissionDao.problemPopulationPath).populate(SubmissionDao.teamPopulationPath).exec();
    return submissions.map(submission => submission.toObject());
  }

  static async getSubmissionsGrouped(): Promise<any> { // {'team.division': {_id: divisionId}}
    const result = {};
    const teams: TeamModel[] = (await TeamDao.getTeams()).map(submission => submission.toObject());

    for (let team of teams) {
      if (!team.division) {
        console.error('Bad/stale team: ' + team._id);
        continue;
      }

      const divisionId = team.division._id;
      const teamId = team._id;

      if (!(divisionId in result)) {
        result[divisionId] = {[teamId]: {}};
      }

      else {
        result[divisionId][teamId] = {};
      }
    }

    const submissions: SubmissionModel[] = (await Submission.find().populate(SubmissionDao.problemPopulationPath).populate(SubmissionDao.teamPopulationPath).exec()).map(submission => submission.toObject());

    for (let submission of submissions) {
      if (!submission.team || !submission.problem) {
        console.error('Bad/stale submission: ' + submission._id);
        continue;
      }

      const divisionId = submission.team.division._id;
      const teamId = submission.team._id;
      const problemId = submission.problem._id;

      if (!(problemId in result[divisionId][teamId])) {
        result[divisionId][teamId][problemId] = [submission];
      }

      else {
        result[divisionId][teamId][problemId].push(submission);
      }
    }

    return result;
  }

  // static async getSubmissionsGrouped(division: string): Promise<any> {
  //   let submissions = await Submission.aggregate([{$match: {division}}, {$group: {_id: {team: "$team", problem: "$problem"}, submissions: {$push: "$$ROOT"}}}]).exec();
  //   submissions = await Submission.populate(submissions, SubmissionDao.problemPopulationPath);
  //   submissions = await Submission.populate(submissions, SubmissionDao.teamPopulationPath);
  //   console.log(submissions);
  //   // submissions = submissions.map(submission => submission.toObject());
  //
  //   const result = {};
  //
  //   submissions.forEach(submission => {
  //     if (result[submission._id.team]) {
  //       result[submission._id.team][submission._id.problem] = submission.submissions;
  //     }
  //
  //     else {
  //       result[submission._id.team] = {[submission._id.problem]: submission.submissions};
  //     }
  //   });
  //
  //   return result;
  // }

  static getDisputedSubmissions(): Promise<SubmissionModel[]> {
    return Submission.find({'dispute.open': true}).populate(SubmissionDao.problemPopulationPath).populate(SubmissionDao.teamPopulationPath).exec();
  }

  static async getScoreForTeam(teamId: string): Promise<number> {
    // This is needed because if the score is calculated in team.dao, there is circular population.
    const submissions = await Submission.find({team: teamId}).populate(SubmissionDao.problemPopulationPath).populate(SubmissionDao.teamPopulationPath).exec();
    return submissions.reduce((previousValue: number, currentValue: SubmissionType) => previousValue + (currentValue.toObject().points || 0), 0);
  }

  static addSubmission(submission: SubmissionModel): Promise<SubmissionModel> {
    return Submission.create(submission);
  }

  static async updateSubmission(id: string, submission: SubmissionModel): Promise<SubmissionModel> {
    const subm = await Submission.findOneAndUpdate({_id: id}, submission, {new: true}).populate(SubmissionDao.problemPopulationPath).populate(SubmissionDao.teamPopulationPath).exec();
    SocketManager.instance.emit(subm.team._id.toString(), new UpdateTeamPacket());
    return subm;
  }

  static async deleteSubmission(id: string): Promise<void> {
    const submission = await SubmissionDao.getSubmission(id);
    await Submission.deleteOne({_id: id}).exec();
    SocketManager.instance.emit(submission.team._id.toString(), new UpdateTeamPacket());
  }
}
