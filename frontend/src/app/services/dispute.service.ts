import { Injectable } from '@angular/core';
import {Column, SingleEntityService} from "./entity.service";
import {SubmissionService} from "./submission.service";
import {SubmissionModel} from "../../../../common/src/models/submission.model";

@Injectable({
  providedIn: 'root'
})
export class DisputeService extends SingleEntityService<SubmissionModel> {

  constructor(private submissionService: SubmissionService) {
    super({
      entityName: 'dispute',
      columns: [
        {name: 'team', link: (entity: SubmissionModel) => ['/admin', 'team', entity.team._id]},
        'problem',
        {name: 'submission', link: (entity: SubmissionModel) => ['/admin', 'submission', entity._id]},
      ]
    });
  }

  getAll(): Promise<SubmissionModel[]> {
    return this.submissionService.getDisputedSubmissions();
  }

  getData(column: Column, value: SubmissionModel): any | undefined {
    if (column.name === 'team') {
      return value.team.username;
    }

    else if (column.name === 'problem') {
      return value.problem.title;
    }

    return value.result;
  }
}
