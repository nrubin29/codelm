import * as mongoose from 'mongoose';
import {
  DivisionModel,
  DivisionType,
} from '@codelm/common/src/models/division.model';
import { PersonExperience } from '@codelm/common/src/models/person.model';

type DivisionDocumentType = DivisionModel & mongoose.Document;

const DivisionSchema = new mongoose.Schema({
  name: String,
  type: { type: String, default: DivisionType.Competition },
  experience: String,
});

const Division = mongoose.model<DivisionDocumentType>(
  'Division',
  DivisionSchema
);

export class DivisionDao {
  static getDivision(id: string): Promise<DivisionModel> {
    return Division.findById(id).exec();
  }

  static getDivisionByName(name: string): Promise<DivisionModel> {
    return Division.findOne({ name }).exec();
  }

  static getDivisions(): Promise<DivisionModel[]> {
    return Division.find().exec();
  }

  static getDivisionsOfType(
    divisionType: DivisionType
  ): Promise<DivisionModel[]> {
    return Division.find({ type: divisionType }).exec();
  }

  static getDivisionsByExperience(
    experience: PersonExperience
  ): Promise<DivisionModel[]> {
    return Division.find({ experience: experience }).exec();
  }

  static addOrUpdateDivision(division: DivisionModel): Promise<DivisionModel> {
    if (!division._id) {
      return Division.create(division);
    } else {
      return Division.findByIdAndUpdate(division._id, division, {
        new: true,
      }).exec();
    }
  }

  static deleteDivision(id: string): Promise<any> {
    return Division.deleteOne({ _id: id }).exec();
  }
}
