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
  state: SettingsState;
  schedule: ScheduleModel[];
  practice: boolean;
  registration: boolean;
  endSurveyLink: string;
}

export const defaultSettingsModel: SettingsModel = Object.freeze({
  state: SettingsState.Closed,
  schedule: [],
  practice: false,
  registration: false,
  endSurveyLink: '#',
});
