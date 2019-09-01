import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { ProblemService } from '../services/problem.service';
import { ProblemModel } from '../../../../common/src/models/problem.model';

@Injectable({
  providedIn: 'root'
})
export class ProblemResolve implements Resolve<ProblemModel> {
  constructor(private problemService: ProblemService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<ProblemModel> {
    return this.problemService.getProblem(route.paramMap.get('id'));
  }
}
