import * as mongoose from 'mongoose';
import { QueryPopulateOptions } from 'mongoose';
import { TeamModel } from '@codelm/common/src/models/team.model';
import { SubmissionDao } from './submission.dao';
import { ModelDocument } from './dao';

type TeamDocument = ModelDocument<TeamModel>;

const TeamSchema = new mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    division: { type: mongoose.Schema.Types.ObjectId, ref: 'Division' },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Team = mongoose.model<TeamDocument>('Team', TeamSchema);

export class TeamDao {
  private static readonly populationPaths: QueryPopulateOptions[] = [
    { path: 'division' },
    { path: 'members', populate: { path: 'group' } },
  ];

  static async getTeam(id: string): Promise<TeamModel | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    return await TeamDao.addScore(await Team.findById(id).exec());
  }

  static async getTeams(): Promise<TeamModel[]> {
    return await TeamDao.addScores(await Team.find().exec());
  }

  static async getTeamsForDivision(divisionId: string): Promise<TeamModel[]> {
    return await TeamDao.addScores(
      await Team.find({ division: { _id: divisionId } }).exec()
    );
  }

  static async getTeamsForPerson(personId: string): Promise<TeamModel[]> {
    return await TeamDao.addScores(
      await Team.find({ members: personId })
        .populate(TeamDao.populationPaths)
        .exec()
    );
  }

  static async deleteTeams(teamUsernames: readonly string[]): Promise<void> {
    await Team.deleteMany({ username: { $in: teamUsernames } });
  }

  static async createTeams(
    teams: Omit<TeamModel, '_id'>[]
  ): Promise<TeamModel[]> {
    const teamDocuments = await Promise.all(
      teams.map(team => Team.create(team))
    );
    return await TeamDao.addScores(teamDocuments);
  }

  static async addOrUpdateTeam(team: TeamModel): Promise<TeamModel> {
    if (!team._id) {
      return await TeamDao.addScore(await Team.create(team));
    } else {
      return await TeamDao.addScore(
        await Team.findByIdAndUpdate(team._id, team, {
          new: true,
          omitUndefined: true,
        }).exec()
      );
    }
  }

  static deleteTeam(id: string): Promise<any> {
    return Team.deleteOne({ _id: id }).exec();
  }

  private static async addScore(team: TeamDocument): Promise<TeamModel> {
    if (team) {
      const score = await SubmissionDao.getScoreForTeam(team._id.toString());
      team.set('score', score, { strict: false });
      team.populate(TeamDao.populationPaths);
      await team.execPopulate();
      return team.toObject();
    } else {
      return null;
    }
  }

  private static async addScores(teams: TeamDocument[]): Promise<TeamModel[]> {
    return await Promise.all(teams.map(team => TeamDao.addScore(team)));
  }
}
