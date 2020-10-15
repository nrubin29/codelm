import { DivisionModel } from './division.model';
import { PersonModel } from './person.model';

export interface TeamModel {
  _id?: string;
  members: PersonModel[];
  division: DivisionModel;
  score?: number; // This is optional because it is a Mongoose virtual.
}
