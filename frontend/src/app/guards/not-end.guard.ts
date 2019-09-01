import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { SettingsService } from '../services/settings.service';
import { SettingsState } from '../../../../common/src/models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class NotEndGuard implements CanActivate {
  constructor(private settingsService: SettingsService, private router: Router) {}

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const settings = await this.settingsService.getSettings();

    if (settings.state === SettingsState.End) {
      return true;
    }

    else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
