import * as mongoose from 'mongoose';
import { PopulateOptions } from 'mongoose';
import { PersonModel } from '@codelm/common/src/models/person.model';
import { LoginResponseType } from '@codelm/common/src/models/auth.model';
import * as crypto from 'crypto';
import { DEBUG } from '../server';
import { TeamModel } from '@codelm/common/src/models/team.model';
import { TeamDao } from './team.dao';
import { SettingsDao } from './settings.dao';
import { SettingsState } from '@codelm/common/src/models/settings.model';
import { DivisionType } from '@codelm/common/src/models/division.model';
import { SocketManager } from '../socket.manager';

type PersonType = PersonModel & mongoose.Document;

const PersonSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  username: { type: String, unique: true },
  password: String,
  salt: String,
  year: String,
  experience: String,
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  teacherEmail: String,
  photoRelease: { type: Boolean, default: false },
  addressRelease: { type: Boolean, default: false },
  addressLine1: { type: String, required: false },
  addressLine2: { type: String, required: false },
  city: { type: String, required: false },
  state: { type: String, required: false },
  zipCode: { type: String, required: false },
});

const Person = mongoose.model<PersonType>('Person', PersonSchema);

export function sanitizePerson(person: PersonModel): PersonModel {
  delete person.password;
  delete person.salt;
  return person;
}

export class PersonDao {
  private static readonly populationPaths: PopulateOptions[] = [
    { path: 'group' },
  ];

  static async getPerson(_id: string): Promise<PersonModel> {
    return (
      await Person.findById(_id).populate(PersonDao.populationPaths).exec()
    ).toObject();
  }

  static async getPeople(): Promise<PersonModel[]> {
    return (
      await Person.find().populate(PersonDao.populationPaths).exec()
    ).map(person => person.toObject());
  }

  static async getPeopleByIds(_ids: string[]): Promise<PersonModel[]> {
    return (
      await Person.find({ _id: { $in: _ids } })
        .populate(PersonDao.populationPaths)
        .exec()
    ).map(person => person.toObject());
  }

  static async getPeopleForGroup(groupId: string): Promise<PersonModel[]> {
    return (
      await Person.find({ group: groupId })
        .populate(PersonDao.populationPaths)
        .exec()
    ).map(person => person.toObject());
  }

  static async login(username: string, password: string): Promise<PersonModel> {
    if (!username || !password) {
      throw LoginResponseType.NotFound;
    }

    const person = await Person.findOne({ username }).populate(
      PersonDao.populationPaths
    );

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
      }

      let team: TeamModel;

      if (settings.practice) {
        // Find the person's practice team.

        team = teams.find(team => team.division.type === DivisionType.Practice);
      } else {
        // Find the person's competition team.

        team = teams.find(
          team => team.division.type === DivisionType.Competition,
        );
      }

      if (team) {
        if (
          !settings.allowSimultaneousTeamMemberLogin &&
          SocketManager.instance.sockets.some(
            socket => socket._id === team._id.toString(),
          )
        ) {
          throw LoginResponseType.TeamMemberAlreadyLoggedIn;
        }

        return team;
      } else {
        throw LoginResponseType.NoTeam;
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
      // For some reason, the object returned by Person.create() has a null
      // _id, so I have to query it again.
      await Person.create(person);
      return (await Person.findOne({ username: person.username })).toObject();
    } else {
      return (
        await Person.findByIdAndUpdate(person._id, person, { new: true })
          .populate(PersonDao.populationPaths)
          .exec()
      ).toObject();
    }
  }

  static deletePerson(_id: string): Promise<any> {
    return Person.deleteOne({ _id }).exec();
  }
}
