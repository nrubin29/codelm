import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { SettingsService } from '../services/settings.service';

@Injectable({
  providedIn: 'root'
})
export class OpenRegistrationGuard implements CanActivate {
  constructor(private settingsService: SettingsService, private router: Router) {}

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    if (next.fragment === 'admin') {
      return true;
    }

    const settings = await this.settingsService.getSettings();

    /*
    Before CodeLM 2019, the preliminaries only had a graded part (no upload part),
    so there was a separate state called SettingsState.Preliminaries.

    There used to be a property called openRegistration that would be true if the users
    could access the registration page because I wanted the users to be able to fill in the
    form and then click Register once it was time to start.

    Now that the preliminaries state has been removed, I renamed openRegistration to preliminaries.
    So that's why this guard has the name that it has.
     */
    return settings.preliminaries;
  }
}
