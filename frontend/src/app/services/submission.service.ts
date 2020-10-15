import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import {
  GradedSubmissionModel,
  isUploadSubmission,
  SubmissionModel,
  SubmissionOverview,
} from '@codelm/common/src/models/submission.model';
import { objectFromEntries } from '@codelm/common/src/utils/submission.util';

@Injectable({
  providedIn: 'root',
})
export class SubmissionService {
  private endpoint = 'submissions';

  constructor(private restService: RestService) {}

  getSubmission(id: string): Promise<SubmissionModel> {
    return this.restService
      .get<SubmissionModel>(`${this.endpoint}/${id}`)
      .then(fixSubmission);
  }

  getSubmissions(): Promise<SubmissionModel[]> {
    return this.restService
      .get<SubmissionModel[]>(this.endpoint)
      .then(fixSubmissions);
  }

  getSubmissionOverview(divisionId: string): Promise<SubmissionOverview> {
    return this.restService.get<SubmissionOverview>(
      `${this.endpoint}/overview/${divisionId}`
    );
  }

  getSubmissionsForTeam(teamId: string): Promise<SubmissionModel[]> {
    return this.restService
      .get<SubmissionModel[]>(`${this.endpoint}/team/${teamId}`)
      .then(fixSubmissions);
  }

  getSubmissionsForTeamAndProblem(
    teamId: string,
    problemId: string
  ): Promise<SubmissionModel[]> {
    return this.restService
      .get<SubmissionModel[]>(
        `${this.endpoint}/problem/${problemId}/team/${teamId}`
      )
      .then(fixSubmissions);
  }

  getDisputedSubmissions(): Promise<GradedSubmissionModel[]> {
    return this.restService.get<GradedSubmissionModel[]>(
      `${this.endpoint}/disputes`
    );
  }

  updateSubmission(submission: SubmissionModel): Promise<SubmissionModel> {
    let safeSubmission = submission;

    if (isUploadSubmission(safeSubmission)) {
      safeSubmission = Object.assign({}, safeSubmission, {
        rubric: objectFromEntries(safeSubmission.rubric),
      });
    }

    return this.restService
      .put<SubmissionModel>(
        `${this.endpoint}/${safeSubmission._id}`,
        safeSubmission
      )
      .then(fixSubmission);
  }

  deleteSubmission(id: string): Promise<void> {
    return this.restService.delete<void>(`${this.endpoint}/${id}`);
  }
}

function fixSubmission(submission: SubmissionModel) {
  if (isUploadSubmission(submission)) {
    submission.rubric = new Map<string, number>(
      Object.entries(submission.rubric)
    );
  }

  return submission;
}

function fixSubmissions(submissions: SubmissionModel[]) {
  return submissions.map(fixSubmission);
}
