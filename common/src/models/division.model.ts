export enum DivisionType {
  Competition = 'Competition',
  Preliminaries = 'Preliminaries',
  Special = 'Special',
}

export interface DivisionModel {
  _id: string;
  name: string;
  type: DivisionType;
}
