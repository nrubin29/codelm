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
 * The navigation is allowed if the current state is NOT End.
 */
@Injectable({
  providedIn: 'root',
})
export class IsNotEndGuard implements CanActivate {
  constructor(
    private settingsService: SettingsService,
    private router: Router
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    if (this.router.getCurrentNavigation()?.extras?.state?.force) {
      return true;
    }

    try {
      const settings = await this.settingsService.getSettings();

      if (settings.state === SettingsState.End) {
        this.router.navigate(['end']);
        return false;
      }

      return true;
    } catch {
      // For DisconnectedComponent, we won't be able to contact the server, so we let it load anyway.
      return true;
    }
  }
}
