import * as mongoose from 'mongoose';
import {
  DivisionModel,
  DivisionType,
} from '@codelm/common/src/models/division.model';
import { PersonExperience } from '@codelm/common/src/models/person.model';
import { ModelDocument } from './dao';

type DivisionDocument = ModelDocument<DivisionModel>;

const DivisionSchema = new mongoose.Schema({
  name: String,
  type: { type: String, default: DivisionType.Competition },
  experience: String,
});

const Division = mongoose.model<DivisionDocument>('Division', DivisionSchema);

export class DivisionDao {
  static getDivision(id: string): Promise<DivisionModel> {
    return Division.findById(id).lean().exec();
  }

  static getDivisionByName(name: string): Promise<DivisionModel> {
    return Division.findOne({ name }).lean().exec();
  }

  static getDivisions(): Promise<DivisionModel[]> {
    return Division.find().lean().exec();
  }

  static getDivisionsOfType(
    divisionType: DivisionType
  ): Promise<DivisionModel[]> {
    return Division.find({ type: divisionType }).lean().exec();
  }

  static getDivisionsByExperience(
    experience: PersonExperience
  ): Promise<DivisionModel[]> {
    return Division.find({ experience: experience }).lean().exec();
  }

  static async addOrUpdateDivision(
    division: DivisionModel
  ): Promise<DivisionModel> {
    if (!division._id) {
      return (await Division.create(division)).toObject();
    } else {
      return await Division.findByIdAndUpdate(division._id, division, {
        new: true,
      })
        .lean()
        .exec();
    }
  }

  static deleteDivision(id: string): Promise<any> {
    return Division.deleteOne({ _id: id }).exec();
  }
}
