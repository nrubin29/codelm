import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { SubmitComponent } from '../competition/views/submit/submit.component';
import { ProblemService } from '../services/problem.service';

@Injectable({
  providedIn: 'root'
})
export class SubmittingGuard implements CanActivate, CanDeactivate<SubmitComponent> {
  constructor(private problemService: ProblemService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.problemService.peekProblemSubmission !== undefined;
  }

  canDeactivate(component: SubmitComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): boolean {
    return component.finished;
  }
}
