import { DivisionModel } from './division.model';
import { UserModel } from './user.model';

export interface TeamModel extends UserModel {
  members: string;
  division: DivisionModel;
  score?: number; // This is optional because it is a Mongoose virtual.
}