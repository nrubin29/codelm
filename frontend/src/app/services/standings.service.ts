import { Injectable } from '@angular/core';
import { SubmissionOverviewElement } from '@codelm/common/src/models/submission.model';
import { SubmissionService } from './submission.service';
import { Column, GroupedEntityService } from './entity.service';
import { DivisionModel } from '@codelm/common/src/models/division.model';
import { DivisionService } from './division.service';
import { ProblemService } from './problem.service';
import { TeamUtil } from '@codelm/common/src/utils/team.util';

@Injectable({
  providedIn: 'root',
})
export class StandingsService extends GroupedEntityService<
  SubmissionOverviewElement,
  DivisionModel
> {
  constructor(
    private divisionService: DivisionService,
    private submissionService: SubmissionService,
    private problemService: ProblemService
  ) {
    super({
      entityName: 'standing',
      columns: [
        {
          name: 'team',
          link: (entity: SubmissionOverviewElement) => [
            '/admin',
            'team',
            entity.team._id,
          ],
        } as Column,
        { name: 'score' },
      ],
      editable: false,
      refresh: true,
    });
  }

  getParents(): Promise<DivisionModel[]> {
    return this.divisionService.getAll();
  }

  getChildren(parent: DivisionModel): Promise<SubmissionOverviewElement[]> {
    return this.submissionService.getSubmissionOverview(parent._id);
  }

  getGroupLabel(parent: DivisionModel): string {
    return parent.name;
  }

  async getDynamicColumns(parent?: DivisionModel) {
    return (await this.problemService.getProblems(parent._id)).map(problem => ({
      name: problem.title,
      value: problem,
      display: 'custom' as const,
    }));
  }

  getData(column: Column, value: SubmissionOverviewElement): any | undefined {
    if (column.name === 'team') {
      return TeamUtil.getName(value.team);
    } else if (column.name === 'score') {
      return value.team.score;
    }
  }

  getName(entity: SubmissionOverviewElement) {
    return entity.team
      ? `Standings for ${TeamUtil.getName(entity.team)}`
      : 'Standings';
  }
}
