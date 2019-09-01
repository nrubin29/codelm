import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { SubmissionModel } from '../../../../common/src/models/submission.model';
import { SubmissionService } from '../services/submission.service';

@Injectable({
  providedIn: 'root'
})
export class DisputesResolve implements Resolve<SubmissionModel[]> {
  constructor(private submissionService: SubmissionService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<SubmissionModel[]> {
    return this.submissionService.getDisputedSubmissions();
  }
}
