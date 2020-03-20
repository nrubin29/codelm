import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { SettingsService } from '../services/settings.service';

@Injectable({
  providedIn: 'root'
})
export class OpenRegistrationGuard implements CanActivate {
  constructor(private settingsService: SettingsService) {}

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const settings = await this.settingsService.getSettings();
    return settings.registration;
  }
}
