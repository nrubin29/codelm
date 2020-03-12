import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import { ProblemService } from '../services/problem.service';
import { DivisionService } from '../services/division.service';
import {EntityService} from "../services/entity.service";
import {DisputeService} from "../services/dispute.service";
import {AdminService} from "../services/admin.service";
import {StandingsService} from "../services/standings.service";
import {TeamService} from "../services/team.service";
import {SettingsService} from "../services/settings.service";
import {SocketRestService} from "../services/socket-rest.service";

@Injectable({
  providedIn: 'root'
})
export class EntityServiceResolve implements Resolve<EntityService<any>> {
  constructor(
    private adminService: AdminService,
    private disputeService: DisputeService,
    private divisionService: DivisionService,
    private problemService: ProblemService,
    private settingsService: SettingsService,
    private socketRestService: SocketRestService,
    private standingsService: StandingsService,
    private teamService: TeamService,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): EntityService<any> {
    switch (route.url[0].path) {
      case 'add-team': return this.teamService;
      case 'admins': return this.adminService;
      case 'disputes': return this.disputeService;
      case 'divisions': return this.divisionService;
      case 'problems': return this.problemService;
      case 'settings': return this.settingsService;
      case 'sockets': return this.socketRestService;
      case 'standings': return this.standingsService;
      case 'team': return this.teamService;
    }
  }
}
