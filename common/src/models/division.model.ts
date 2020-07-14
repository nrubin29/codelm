import { SettingsState } from './settings.model';

export enum DivisionType {
  Competition = 'Competition',
  Preliminaries = 'Preliminaries',
  Special = 'Special',
}

export interface StarterCode {
  state: SettingsState;
  file: string;
}

export interface DivisionModel {
  _id: string;
  name: string;
  type: DivisionType;
  starterCode: StarterCode[];
}

export type DivisionModelForUpload = Omit<DivisionModel, 'starterCode'> & {
  starterCode: {
    state: SettingsState;
    file: string | File;
  }[];
};
