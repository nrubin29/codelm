import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { SettingsService } from '../services/settings.service';
import { SettingsState } from '../../../../common/src/models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class EndGuard implements CanActivate {
  constructor(private settingsService: SettingsService, private router: Router) {}

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    if (next.fragment === 'admin') {
      return true;
    }

    try {
      const settings = await this.settingsService.getSettings();

      if (settings.state === SettingsState.End) {
        this.router.navigate(['end']);
        return false;
      }

      return true;
    }

    catch {
      // For DisconnectedComponent, we won't be able to contact the server, so we let it load anyway.
      return true;
    }
  }
}
