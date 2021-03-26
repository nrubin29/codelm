import * as mongoose from 'mongoose';
import { QueryPopulateOptions } from 'mongoose';
import { PersonModel } from '@codelm/common/src/models/person.model';
import { LoginResponseType } from '@codelm/common/src/models/auth.model';
import * as crypto from 'crypto';
import { DEBUG } from '../server';
import { TeamModel } from '@codelm/common/src/models/team.model';
import { TeamDao } from './team.dao';
import { SettingsDao } from './settings.dao';
import { SettingsState } from '@codelm/common/src/models/settings.model';
import { DivisionType } from '@codelm/common/src/models/division.model';
import { ModelDocument } from './dao';

type PersonDocument = ModelDocument<PersonModel>;

const PersonSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  username: { type: String, unique: true },
  password: String,
  salt: String,
  year: String,
  experience: String,
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
});

const Person = mongoose.model<PersonDocument>('Person', PersonSchema);

export function sanitizePerson(person: PersonModel): PersonModel {
  delete person.password;
  delete person.salt;
  return person;
}

export class PersonDao {
  private static readonly populationPaths: QueryPopulateOptions[] = [
    { path: 'group' },
  ];

  static getPerson(_id: string): Promise<PersonModel> {
    return Person.findById(_id)
      .lean()
      .populate(PersonDao.populationPaths)
      .exec();
  }

  private static getPersonByUsername(username: string): Promise<PersonModel> {
    return Person.findOne({ username })
      .lean()
      .populate(PersonDao.populationPaths)
      .exec();
  }

  static getPeople(): Promise<PersonModel[]> {
    return Person.find().lean().populate(PersonDao.populationPaths).exec();
  }

  static getPeopleByIds(_ids: string[]): Promise<PersonModel[]> {
    return Person.find({ _id: { $in: _ids } })
      .lean()
      .populate(PersonDao.populationPaths)
      .exec();
  }

  static async getPeopleForGroup(groupId: string): Promise<PersonModel[]> {
    return Person.find({ group: groupId })
      .lean()
      .populate(PersonDao.populationPaths)
      .exec();
  }

  static async login(username: string, password: string): Promise<PersonModel> {
    if (!username || !password) {
      throw LoginResponseType.NotFound;
    }

    const person = await PersonDao.getPersonByUsername(username);

    if (!person) {
      throw LoginResponseType.NotFound;
    }

    const inputHash = crypto
      .pbkdf2Sync(password, new Buffer(person.salt), 1000, 64, 'sha512')
      .toString('hex');

    if (DEBUG || inputHash === person.password) {
      return person;
    } else {
      throw LoginResponseType.IncorrectPassword;
    }
  }

  static async getActiveTeam(person: PersonModel): Promise<TeamModel> {
    const teams = await TeamDao.getTeamsForPerson(person._id);

    if (person.group.special) {
      // Assert that this person has exactly one associated team and then log
      // that team in regardless of settings state.

      if (teams.length !== 1) {
        throw LoginResponseType.SpecialPersonError;
      }

      return teams[0];
    } else {
      const settings = await SettingsDao.getSettings();

      if (
        settings.state === SettingsState.Closed ||
        settings.state === SettingsState.End
      ) {
        throw LoginResponseType.Closed;
      } else if (settings.practice) {
        // Find the team for the person that is in a practice division;
        // reject one if it does not exist.

        const team = teams.find(
          team => team.division.type === DivisionType.Practice
        );

        if (team) {
          return team;
        } else {
          throw LoginResponseType.NoTeam;
        }
      } else {
        // Find the team for the person that is in a competition division;
        // reject if one does not exist.

        const team = teams.find(
          team => team.division.type === DivisionType.Competition
        );

        if (team) {
          return team;
        } else {
          throw LoginResponseType.NoTeam;
        }
      }
    }
  }

  static async addOrUpdatePerson(person: PersonModel): Promise<PersonModel> {
    if (person.password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto
        .pbkdf2Sync(person.password, new Buffer(salt), 1000, 64, 'sha512')
        .toString('hex');

      person.salt = salt;
      person.password = hash;
    } else if (person.password === '') {
      delete person.password;
    }

    if (!person._id) {
      try {
        // For some reason, the object returned by Person.create() has a null
        // _id, so I have to query it again.
        await Person.create(person);
        return await PersonDao.getPersonByUsername(person.username);
      } catch (err) {
        if (err.code !== undefined && err.code === 11000) {
          // It's a MongoError for non-unique username.
          throw Error('This email address or username is already registered.');
        } else {
          throw err;
        }
      }
    } else {
      return await Person.findByIdAndUpdate(person._id, person, { new: true })
        .lean()
        .populate(PersonDao.populationPaths)
        .exec();
    }
  }

  static deletePerson(_id: string): Promise<any> {
    return Person.deleteOne({ _id }).exec();
  }
}
