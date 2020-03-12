import { Injectable } from '@angular/core';
import {Column, SingleEntityService} from "./entity.service";
import {SubmissionService} from "./submission.service";
import {GradedSubmissionModel} from "../../../../common/src/models/submission.model";

@Injectable({
  providedIn: 'root'
})
export class DisputeService extends SingleEntityService<GradedSubmissionModel> {

  constructor(private submissionService: SubmissionService) {
    super({
      entityName: 'dispute',
      columns: [
        {name: 'team', link: (entity: GradedSubmissionModel) => ['/admin', 'team', entity.team._id]},
        {name: 'problem'},
        {name: 'submission', link: (entity: GradedSubmissionModel) => ['/admin', 'submission', entity._id]},
      ],
      editable: false,
    });
  }

  getAll(): Promise<GradedSubmissionModel[]> {
    return this.submissionService.getDisputedSubmissions();
  }

  getData(column: Column, value: GradedSubmissionModel): any | undefined {
    if (column.name === 'team') {
      return value.team.username;
    }

    else if (column.name === 'problem') {
      return value.problem.title;
    }

    return value.result;
  }

  getName(entity: Partial<GradedSubmissionModel>) {
    return entity.problem && entity.team ? `Dispute for ${entity.problem.title} by ${entity.team.username}` : 'Dispute';
  }
}
