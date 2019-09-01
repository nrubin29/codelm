import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { SettingsService } from '../services/settings.service';
import { SettingsModel } from '../../../../common/src/models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsResolve implements Resolve<SettingsModel> {
  constructor(private settingsService: SettingsService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<SettingsModel> {
    return this.settingsService.getSettings();
  }
}
