import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProblemModel } from '@codelm/common/src/models/problem.model';
import { TeamModel } from '@codelm/common/src/models/team.model';
import { SubmissionModel } from '@codelm/common/src/models/submission.model';
import { SubmissionService } from '../../../services/submission.service';
import { format, parseJSON } from 'date-fns';
import { TeamUtil } from '@codelm/common/src/utils/team.util';

@Component({
  selector: 'app-view-submissions',
  templateUrl: './view-submissions.component.html',
  styleUrls: ['./view-submissions.component.scss'],
})
export class ViewSubmissionsComponent implements OnInit {
  submissions: SubmissionModel[];

  // TODO: Make columns sortable
  // TODO: Display an ! icon next to submissions with disputes open

  constructor(
    private submissionService: SubmissionService,
    public dialogRef: MatDialogRef<ViewSubmissionsComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { problem: ProblemModel; team: TeamModel }
  ) {}

  ngOnInit() {
    this.submissionService
      .getSubmissionsForTeamAndProblem(
        this.data.team._id,
        this.data.problem._id
      )
      .then(submissions => (this.submissions = submissions.reverse()));
  }

  get teamName() {
    return TeamUtil.getName(this.data.team);
  }

  formatDate(date: string): string {
    return format(parseJSON(date), 'MMM d, h:mm:ss a');
  }

  close() {
    this.dialogRef.close();
  }
}
