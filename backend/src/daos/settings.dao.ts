import * as mongoose from 'mongoose';
import {
  defaultSettingsModel,
  SettingsModel,
  SettingsState,
} from '@codelm/common/src/models/settings.model';
import { Job, scheduleJob } from 'node-schedule';
import { SocketManager } from '../socket.manager';

type SettingsType = SettingsModel & mongoose.Document;

const ScheduleSchema = new mongoose.Schema({
  newState: String,
  when: Date,
});

const SettingsSchema = new mongoose.Schema({
  state: { type: String, default: SettingsState.Closed },
  schedule: [ScheduleSchema],
  practice: { type: Boolean, default: false },
  registration: { type: Boolean, default: false },
  allowSimultaneousTeamMemberLogin: { type: Boolean, default: false },
  endSurveyLink: { type: String, default: '#' },
});

const Settings = mongoose.model<SettingsType>('Settings', SettingsSchema);

export class SettingsDao {
  private static jobs: Job[];

  static async getSettings(): Promise<SettingsModel> {
    const settings = await Settings.findOne().exec();

    if (settings) {
      return settings;
    } else {
      return await Settings.create(defaultSettingsModel);
    }
  }

  static async updateSettings(settings: any): Promise<SettingsModel> {
    const oldSettings: SettingsModel = await SettingsDao.getSettings();
    const newSettings: SettingsModel = await Settings.findOneAndUpdate(
      {},
      settings,
      { upsert: true, new: true }
    ).exec();

    SettingsDao.scheduleJobs(newSettings);
    SocketManager.instance.sendToAll({ name: 'updateSettings' });

    if (oldSettings.state !== newSettings.state) {
      SocketManager.instance.sendToAll({
        name: 'stateSwitch',
        newState: newSettings.state,
      });
    }

    if (
      newSettings.state === SettingsState.Closed ||
      newSettings.state === SettingsState.End
    ) {
      SocketManager.instance.kickTeams();
    }

    return newSettings;
  }

  private static resetJobs() {
    if (SettingsDao.jobs !== undefined) {
      SettingsDao.jobs.forEach(job => job.cancel());
    }

    SettingsDao.jobs = [];
  }

  static scheduleJobs(settings: SettingsModel): number {
    SettingsDao.resetJobs();

    settings.schedule.forEach(schedule => {
      const job = scheduleJob(
        schedule.when,
        function (newState: SettingsState) {
          Settings.updateOne({}, { $set: { state: newState } })
            .exec()
            .then(() => {
              SocketManager.instance.sendToAll({
                name: 'stateSwitch',
                newState,
              });

              if (
                newState === SettingsState.Closed ||
                newState === SettingsState.End
              ) {
                SocketManager.instance.kickTeams();
              }
            });
        }.bind(null, schedule.newState)
      );

      if (job !== null) {
        SettingsDao.jobs.push(job);
      }
    });

    return SettingsDao.jobs.length;
  }

  static async resetSettings(): Promise<SettingsModel> {
    await Settings.deleteOne({}).exec();
    const settings = await Settings.create(defaultSettingsModel);
    SettingsDao.resetJobs();
    SocketManager.instance.sendToAll({ name: 'updateSettings' });
    return settings;
  }
}
