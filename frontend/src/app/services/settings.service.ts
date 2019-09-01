import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { SettingsModel } from '../../../../common/src/models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private endpoint = 'settings';

  constructor(private restService: RestService) {}

  getSettings(): Promise<SettingsModel> {
    return this.restService.get<SettingsModel>(this.endpoint);
  }

  updateSettings(settings: any): Promise<SettingsModel> {
    return this.restService.put<SettingsModel>(this.endpoint, settings);
  }

  resetSettings(): Promise<SettingsModel> {
    return this.restService.delete<SettingsModel>(this.endpoint);
  }
}
