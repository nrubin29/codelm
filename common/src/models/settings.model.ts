export enum SettingsState {
  Graded = 'Graded',
  Upload = 'Upload',
  Closed = 'Closed',
  End = 'End',
  Debug = 'Debug',
}

export interface ScheduleModel {
  newState: SettingsState;
  when: Date;
}

export interface SettingsModel {
  _id?: string;
  state: SettingsState;
  schedule: ScheduleModel[];
  preliminaries: boolean;
  registration: boolean;
  endSurveyLink: string;
}

export const defaultSettingsModel: SettingsModel = Object.freeze({
  state: SettingsState.Closed,
  schedule: [],
  preliminaries: false,
  registration: false,
  endSurveyLink: '#',
});
