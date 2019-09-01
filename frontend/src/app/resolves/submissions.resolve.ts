import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { SubmissionModel } from '../../../../common/src/models/submission.model';
import { SubmissionService } from '../services/submission.service';
import { AdminService } from '../services/admin.service';

@Injectable({
  providedIn: 'root'
})
export class SubmissionsResolve implements Resolve<SubmissionModel[]> {
  constructor(private adminService: AdminService, private submissionService: SubmissionService) {}

  // TODO: Only get submissions for given problem when this resolve is used for /dashboard/problem
  resolve(route: ActivatedRouteSnapshot): Promise<SubmissionModel[]> {
    if (this.adminService.admin.getValue()) {
      return this.submissionService.getSubmissionsForTeam(route.params.id);
    }

    else {
      return this.submissionService.getSubmissions();
    }
  }
}
