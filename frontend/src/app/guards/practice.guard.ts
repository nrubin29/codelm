import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { SettingsService } from '../services/settings.service';

/**
 * The navigation is allowed if practice mode is enabled.
 */
@Injectable({
  providedIn: 'root',
})
export class PracticeGuard implements CanActivate {
  constructor(
    private settingsService: SettingsService,
    private router: Router
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const settings = await this.settingsService.getSettings();

    if (!settings.practice) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
