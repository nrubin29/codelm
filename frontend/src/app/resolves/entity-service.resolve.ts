import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import { ProblemService } from '../services/problem.service';
import { DivisionService } from '../services/division.service';
import {EntityService} from "../services/entity.service";
import {DisputeService} from "../services/dispute.service";
import {AdminService} from "../services/admin.service";
import {StandingsService} from "../services/standings.service";

@Injectable({
  providedIn: 'root'
})
export class EntityServiceResolve implements Resolve<EntityService<any, any>> {
  constructor(
    private adminService: AdminService,
    private disputeService: DisputeService,
    private divisionService: DivisionService,
    private problemService: ProblemService,
    private standingsService: StandingsService,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): EntityService<any, any> {
    const path = state.url.substring(state.url.lastIndexOf('/') + 1);

    switch (path) {
      case 'admins': return this.adminService;
      case 'disputes': return this.disputeService;
      case 'divisions': return this.divisionService;
      case 'problems': return this.problemService;
      case 'standings': return this.standingsService;
    }
  }
}
