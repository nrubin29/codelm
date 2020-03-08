import { Injectable } from '@angular/core';
import {SingleEntityService} from "./entity.service";
import {SubmissionService} from "./submission.service";
import {SubmissionModel} from "../../../../common/src/models/submission.model";

@Injectable({
  providedIn: 'root'
})
export class DisputeService implements SingleEntityService {

  columns = [
    {name: 'team', link: (entity: SubmissionModel) => ['/admin', 'team', entity.team._id]},
    'problem',
    {name: 'submission', link: (entity: SubmissionModel) => ['/admin', 'submission', entity._id]},
  ];
  title = 'Disputes';
  type = 'single' as const;

  constructor(private submissionService: SubmissionService) {}

  getAll(): Promise<SubmissionModel[]> {
    return this.submissionService.getDisputedSubmissions();
  }

  getData(column: string, value: SubmissionModel): any | undefined {
    if (column === 'team') {
      return value.team.username;
    }

    else if (column === 'problem') {
      return value.problem.title;
    }

    return value.result;
  }
}
