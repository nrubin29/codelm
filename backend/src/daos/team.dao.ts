import mongoose = require('mongoose');
import crypto = require('crypto');
import { TeamModel } from '../../../common/src/models/team.model';
import { LoginResponse } from '../../../common/src/packets/login.response.packet';
import { SubmissionDao } from './submission.dao';

type TeamType = TeamModel & mongoose.Document;

const TeamSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  password: String,
  salt: String,
  members: String,
  division: {type: mongoose.Schema.Types.ObjectId, ref: 'Division'},
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export function sanitizeTeam(team: TeamModel): TeamModel {
  team.password = undefined;
  team.salt = undefined;
  return team;
}

// I don't really want this, but it might allow me to synchronously calculate the score. Too bad it doesn't work.
// TeamSchema.virtual('submissions', {
//   ref: 'Submission',
//   localField: '_id',
//   foreignField: 'team'
// });

// TODO: Since this doesn't work, I should a nicer way to calculate the score than what I have right now.
// TeamSchema.virtual('score').get(function() {
//   return new Promise<number>((resolve, reject) => {
//     SubmissionDao.getSubmissionsForTeam(this._id).then(submissions => {
//       resolve(submissions.reduce(((previousValue: number, currentValue: any) => previousValue + currentValue.toObject().points), 0));
//     }).catch(reject);
//   });
// });

const Team = mongoose.model<TeamType>('Team', TeamSchema);

export class TeamDao {
  static async getTeam(id: string): Promise<TeamModel> {
    return await TeamDao.addScore(await Team.findById(id).populate('division').exec());
  }

  static async getTeams(): Promise<TeamType[]> {
    return await TeamDao.addScores(await Team.find().populate('division').exec());
  }

  static async getTeamsForDivision(divisionId: string): Promise<TeamModel[]> {
    return await TeamDao.addScores(await Team.find({division: {_id: divisionId}}).populate('division').exec());
  }

  static async login(username: string, password: string): Promise<TeamModel> {
    if (!username || !password) {
      throw LoginResponse.NotFound;
    }

    const team = await Team.findOne({username: username}).populate('division');

    if (!team) {
      throw LoginResponse.NotFound;
    }

    const inputHash = crypto.pbkdf2Sync(password, new Buffer(team.salt), 1000, 64, 'sha512').toString('hex');

    if (inputHash === team.password) {
      return await TeamDao.addScore(team);
    }

    else {
      throw LoginResponse.IncorrectPassword;
    }
  }

  static async addOrUpdateTeam(team: any): Promise<TeamModel> {
    if (team.password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(team.password, new Buffer(salt), 1000, 64, 'sha512').toString('hex');

      team.salt = salt;
      team.password = hash;
    }

    if (!team._id) {
      return await TeamDao.addScore(await Team.create(team as TeamModel));
    }

    else {
      return await TeamDao.addScore(await Team.findByIdAndUpdate(team._id, team, {new: true}).exec());
    }
  }

  // TODO: Consolidate code between register() and addOrUpdateTeam()
  static async register(team: any): Promise<TeamModel> {
    if (!team.username || !team.password) {
      throw LoginResponse.NotFound;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(team.password, new Buffer(salt), 1000, 64, 'sha512').toString('hex');

    team.salt = salt;
    team.password = hash;

    // TODO: Check for valid division.

    try {
      const createdTeam = await Team.create(team as TeamModel);
      return await TeamDao.getTeam(createdTeam._id);
    }

    catch (err) {
      if (err.code !== undefined && err.code === 11000) { // It's a MongoError for not-unique username.
        throw LoginResponse.AlreadyExists;
      }

      else {
        throw err;
      }
    }
  }

  static deleteTeam(id: string): Promise<any> {
    return Team.deleteOne({_id: id}).exec();
  }

  private static async addScore(team: TeamType): Promise<TeamType> {
    if (team) {
      const score = await SubmissionDao.getScoreForTeam(team._id);
      team.set('score', score, {strict: false});
      return team;
    }

    else {
      return null;
    }
  }

  private static async addScores(teams: TeamType[]): Promise<TeamType[]> {
    return await Promise.all(teams.map(async team => await TeamDao.addScore(team)));
  }
}
