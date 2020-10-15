import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import {
  SettingsModel,
  SettingsState,
} from '@codelm/common/src/models/settings.model';
import { EntityService } from './entity.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsService extends EntityService<SettingsModel> {
  private endpoint = 'settings';

  constructor(private restService: RestService) {
    super({
      entityName: 'setting',
      attributes: [
        {
          name: 'state',
          type: 'select',
          options: Object.keys(SettingsState).map(
            state => SettingsState[state]
          ),
        },
        { name: 'preliminaries', type: 'boolean' },
        { name: 'registration', type: 'boolean' },
        { name: 'endSurveyLink', optional: true },
        {
          name: 'schedule',
          type: 'table',
          columns: [
            {
              name: 'newState',
              type: 'select',
              options: Object.keys(SettingsState).map(
                state => SettingsState[state]
              ),
            },
            { name: 'when', type: 'date' },
          ],
        },
      ],
    });
  }

  getSettings(): Promise<SettingsModel> {
    return this.restService.get<SettingsModel>(this.endpoint);
  }

  addOrUpdate(settings: any): Promise<SettingsModel> {
    return this.restService.put<SettingsModel>(this.endpoint, settings);
  }

  delete(): Promise<void> {
    return this.restService.delete<void>(this.endpoint);
  }

  getName() {
    return 'Settings';
  }
}
