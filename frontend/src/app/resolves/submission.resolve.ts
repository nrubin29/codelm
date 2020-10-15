import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { SubmissionModel } from '@codelm/common/src/models/submission.model';
import { SubmissionService } from '../services/submission.service';

@Injectable({
  providedIn: 'root',
})
export class SubmissionResolve implements Resolve<SubmissionModel> {
  constructor(
    private submissionService: SubmissionService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Promise<SubmissionModel> {
    if (route.paramMap.get('id') === 'test') {
      return Promise.resolve(
        this.router.getCurrentNavigation().extras.state['submission']
      );
    } else {
      return this.submissionService.getSubmission(route.paramMap.get('id'));
    }
  }
}
