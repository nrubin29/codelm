import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { TeamService } from '../services/team.service';

@Injectable({
  providedIn: 'root'
})
export class TeamGuard implements CanActivate {
  constructor(private teamService: TeamService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.teamService.team.value != null;
  }
}
