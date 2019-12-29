import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import {SubmissionModel, GroupedSubmissions} from '../../../../common/src/models/submission.model';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private endpoint = 'submissions';

  constructor(private restService: RestService) { }

  getSubmission(id: string): Promise<SubmissionModel> {
    return this.restService.get<SubmissionModel>(`${this.endpoint}/${id}`)
  }

  getSubmissions(): Promise<SubmissionModel[]> {
    return this.restService.get<SubmissionModel[]>(this.endpoint);
  }

  getAllSubmissions(): Promise<SubmissionModel[]> {
    return this.restService.get<SubmissionModel[]>(`${this.endpoint}/all`);
  }

  // getSubmissionsGrouped(): Promise<GroupedSubmissions> {
  //   return this.restService.get<GroupedSubmissions>(`${this.endpoint}/grouped`);
  // }

  getSubmissionsForTeam(teamId: string): Promise<SubmissionModel[]> {
    return this.restService.get<SubmissionModel[]>(`${this.endpoint}/team/${teamId}`)
  }

  getDisputedSubmissions(): Promise<SubmissionModel[]> {
    return this.restService.get<SubmissionModel[]>(`${this.endpoint}/disputes`);
  }

  updateSubmission(submission: SubmissionModel): Promise<SubmissionModel> {
    return this.restService.put<SubmissionModel>(`${this.endpoint}/${submission._id}`, submission);
  }

  deleteSubmission(id: string): Promise<void> {
    return this.restService.delete<void>(`${this.endpoint}/${id}`);
  }
}
