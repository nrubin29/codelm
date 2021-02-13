import * as mongoose from 'mongoose';
import { QueryPopulateOptions } from 'mongoose';
import { TeamModel } from '@codelm/common/src/models/team.model';
import { SubmissionDao } from './submission.dao';

type TeamType = TeamModel & mongoose.Document;

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

const Team = mongoose.model<TeamType>('Team', TeamSchema);

export class TeamDao {
  private static readonly populationPaths: QueryPopulateOptions[] = [
    { path: 'division' },
    { path: 'members', populate: { path: 'group' } },
  ];

  static async getTeam(id: string): Promise<TeamModel> {
    return await TeamDao.addScore(
      await Team.findById(id).populate(TeamDao.populationPaths).exec()
    );
  }

  static async getTeams(): Promise<TeamType[]> {
    return await TeamDao.addScores(
      await Team.find().populate(TeamDao.populationPaths).exec()
    );
  }

  static async getTeamsForDivision(divisionId: string): Promise<TeamModel[]> {
    return (
      await TeamDao.addScores(
        await Team.find({ division: { _id: divisionId } })
          .populate(TeamDao.populationPaths)
          .exec()
      )
    ).map(team => team.toObject());
  }

  static async getTeamsForPerson(personId: string): Promise<TeamModel[]> {
    return (
      await TeamDao.addScores(
        await Team.find({ members: personId })
          .populate(TeamDao.populationPaths)
          .exec()
      )
    ).map(team => team.toObject());
  }

  static async deleteTeams(teamUsernames: readonly string[]) {
    await Team.deleteMany({ username: { $in: teamUsernames } });
  }

  static async createTeams(teams: Omit<TeamModel, '_id'>[]) {
    return await Team.create(teams);
  }

  static async addOrUpdateTeam(team: TeamModel): Promise<TeamModel> {
    if (!team._id) {
      return await TeamDao.addScore(await Team.create(team));
    } else {
      return await TeamDao.addScore(
        await Team.findByIdAndUpdate(team._id, team, {
          new: true,
          omitUndefined: true,
        })
          .populate(TeamDao.populationPaths)
          .exec()
      );
    }
  }

  static deleteTeam(id: string): Promise<any> {
    return Team.deleteOne({ _id: id }).exec();
  }

  private static async addScore(team: TeamType): Promise<TeamType> {
    if (team) {
      const score = await SubmissionDao.getScoreForTeam(team._id);
      team.set('score', score, { strict: false });
      team.populate(TeamDao.populationPaths);
      return team;
    } else {
      return null;
    }
  }

  private static async addScores(teams: TeamType[]): Promise<TeamType[]> {
    return await Promise.all(
      teams.map(async team => await TeamDao.addScore(team))
    );
  }
}
