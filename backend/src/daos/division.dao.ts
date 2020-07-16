// import * as mongoose from 'mongoose';
import {
  DivisionModel,
  // DivisionType,
} from '../../../common/src/models/division.model';
import { Dao } from './dao';

export const DivisionDao = new Dao<DivisionModel>('divisions');

// type DivisionDocumentType = DivisionModel & mongoose.Document;
//
// const StarterCode = new mongoose.Schema({
//   state: String,
//   file: String,
// });
//
// const DivisionSchema = new mongoose.Schema({
//   name: String,
//   type: { type: String, default: DivisionType.Competition },
//   starterCode: [StarterCode],
// });
//
// const Division = mongoose.model<DivisionDocumentType>(
//   'Division',
//   DivisionSchema
// );
//
// export class DivisionDao {
//   static getDivision(id: string): Promise<DivisionModel> {
//     return Division.findById(id).exec();
//   }
//
//   static getDivisionByName(name: string): Promise<DivisionModel> {
//     return Division.findOne({ name }).exec();
//   }
//
//   static getDivisions(): Promise<DivisionModel[]> {
//     return Division.find().exec();
//   }
//
//   static getDivisionsOfType(
//     divisionType: DivisionType
//   ): Promise<DivisionModel[]> {
//     return Division.find({ type: divisionType }).exec();
//   }
//
//   static addOrUpdateDivision(division: DivisionModel): Promise<DivisionModel> {
//     if (!division._id) {
//       return Division.create(division);
//     } else {
//       return Division.findByIdAndUpdate(division._id, division, {
//         new: true,
//       }).exec();
//     }
//   }
//
//   static deleteDivision(id: string): Promise<any> {
//     return Division.deleteOne({ _id: id }).exec();
//   }
// }
