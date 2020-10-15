import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { SettingsService } from '../services/settings.service';
import { SettingsState } from '@codelm/common/src/models/settings.model';

/**
 * The navigation is allowed if the current state IS End.
 */
@Injectable({
  providedIn: 'root',
})
export class IsEndGuard implements CanActivate {
  constructor(
    private settingsService: SettingsService,
    private router: Router
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const settings = await this.settingsService.getSettings();

    if (settings.state !== SettingsState.End) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
