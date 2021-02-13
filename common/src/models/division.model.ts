import { PersonExperience } from './person.model';

export enum DivisionType {
  Competition = 'Competition',
  Practice = 'Practice',
  Special = 'Special',
}

export interface DivisionModel {
  _id: string;
  name: string;
  type: DivisionType;
  experience?: PersonExperience;
}
