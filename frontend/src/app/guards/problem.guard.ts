import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { ProblemService } from '../services/problem.service';
import { SubmissionService } from '../services/submission.service';
import { SubmissionUtil } from '../../../../common/src/utils/submission.util';

@Injectable({
  providedIn: 'root'
})
export class ProblemGuard implements CanActivate {
  constructor(private problemService: ProblemService, private submissionService: SubmissionService, private router: Router) {}

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const problem = await this.problemService.getProblem(next.paramMap.get('id'));
    const submissions = await this.submissionService.getSubmissions();
    const solved = SubmissionUtil.getSolution(problem, submissions);

    if (solved) {
      this.router.navigate(['/dashboard', 'submission', solved._id]);
      return false;
    }

    else {
      return true;
    }
  }
}
