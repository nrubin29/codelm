import { DivisionModel } from './division.model';
import { UserModel } from './user.model';
import { PersonModel } from './person.model';

export interface TeamModel extends UserModel {
  members: PersonModel[];
  division: DivisionModel;
  score?: number; // This is optional because it is a Mongoose virtual.
}
