import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {ProblemModel} from "../../../../../../common/src/models/problem.model";
import {TeamModel} from "../../../../../../common/src/models/team.model";
import {SubmissionModel} from "../../../../../../common/src/models/submission.model";
import * as moment from 'moment';
import {SubmissionService} from "../../../services/submission.service";

@Component({
  selector: 'app-view-submissions',
  templateUrl: './view-submissions.component.html',
  styleUrls: ['./view-submissions.component.scss']
})
export class ViewSubmissionsComponent implements OnInit {
  submissions: SubmissionModel[];

  // TODO: Make columns sortable
  // TODO: Display an ! icon next to submissions with disputes open

  constructor(private submissionService: SubmissionService, public dialogRef: MatDialogRef<ViewSubmissionsComponent>, @Inject(MAT_DIALOG_DATA) public data: {problem: ProblemModel, team: TeamModel}) { }

  ngOnInit() {
    this.submissionService.getSubmissionsForTeamAndProblem(this.data.team._id, this.data.problem._id).then(submissions => this.submissions = submissions.reverse());
  }

  formattedDate(date: Date): string {
    return moment(date).format('MMM D, h:mm:ss a');
  }

  close() {
    this.dialogRef.close();
  }
}
