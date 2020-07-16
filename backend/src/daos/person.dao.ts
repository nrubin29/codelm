import * as mongoose from 'mongoose';
import { PersonModel } from '../../../common/src/models/person.model';

type PersonType = PersonModel & mongoose.Document;

const PersonSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  year: String,
  experience: String,
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
});

const Person = mongoose.model<PersonType>('Person', PersonSchema);

export class PersonDao {
  static async getPerson(_id: string): Promise<PersonModel> {
    return (await Person.findById(_id).populate('group').exec()).toObject();
  }

  static async getPeople(): Promise<PersonModel[]> {
    return (await Person.find().populate('group').exec()).map(person =>
      person.toObject()
    );
  }

  static async getPeopleForGroup(groupId: string): Promise<PersonModel[]> {
    return (
      await Person.find({ group: groupId }).populate('group').exec()
    ).map(person => person.toObject());
  }

  static async addOrUpdatePerson(person: PersonModel): Promise<PersonModel> {
    if (!person._id) {
      try {
        return (await Person.create(person)).toObject();
      } catch (err) {
        if (err.code !== undefined && err.code === 11000) {
          // It's a MongoError for non-unique username.
          throw Error('This email address is already registered.');
        } else {
          throw err;
        }
      }
    } else {
      return (
        await Person.findByIdAndUpdate(person._id, person, { new: true })
          .populate('group')
          .exec()
      ).toObject();
    }
  }

  static deletePerson(_id: string): Promise<any> {
    return Person.deleteOne({ _id }).exec();
  }
}
