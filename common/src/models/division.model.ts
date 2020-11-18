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
    file: string | FileLike;
  }[];
};

interface FileLike {
  readonly lastModified: number;
  readonly name: string;
  readonly size: number;
  readonly type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
  slice(start?: number, end?: number, contentType?: string): any;
  stream(): any;
  text(): Promise<string>;
}
