import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { ProblemModel } from '../../../../common/src/models/problem.model';
import { ProblemService } from '../services/problem.service';
import { DivisionModel } from '../../../../common/src/models/division.model';
import { DivisionService } from '../services/division.service';

@Injectable({
  providedIn: 'root'
})
export class DivisionsProblemsResolve implements Resolve<DivisionModelWithProblems[]> {
  constructor(private divisionService: DivisionService, private problemService: ProblemService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<DivisionModelWithProblems[]> {
    return new Promise<DivisionModelWithProblems[]>((resolve, reject) => {
      this.divisionService.getDivisions().then(divs => {
        const divisions = divs.map(division => division as DivisionModelWithProblems);
        Promise.all(divisions.map(division => new Promise<void>((resolve, reject) => {
          this.problemService.getProblems(division._id).then(problems => {
            division.problems = problems;
            resolve();
          }).catch(reject);
        }))).then(() => {
          resolve(divisions);
        });
      }).catch(reject);
    });
  }
}

export type DivisionModelWithProblems = DivisionModel & {problems?: ProblemModel[]};