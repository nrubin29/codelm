import {SettingsState} from "./settings.model";

export enum DivisionType {
  Competition = 'Competition',
  Preliminaries = 'Preliminaries',
  Special = 'Special'
}

export interface StarterCode {
  state: SettingsState;
  file: Buffer|File; // Buffer when it's in the database, File when it's being uploaded from the frontend.
}

export interface DivisionModel {
  _id: string;
  name: string;
  type: DivisionType,
  starterCode: StarterCode[]
}
