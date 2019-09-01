import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {ProblemModel} from "../../../../../../common/src/models/problem.model";
import {TeamModel} from "../../../../../../common/src/models/team.model";
import {SubmissionModel} from "../../../../../../common/src/models/submission.model";
import * as moment from 'moment';

@Component({
  selector: 'app-view-submissions',
  templateUrl: './view-submissions.component.html',
  styleUrls: ['./view-submissions.component.scss']
})
export class ViewSubmissionsComponent implements OnInit {
  // TODO: Make columns sortable
  // TODO: Display an ! icon next to submissions with disputes open

  constructor(public dialogRef: MatDialogRef<ViewSubmissionsComponent>, @Inject(MAT_DIALOG_DATA) public data: {problem: ProblemModel, team: TeamModel, submissions: SubmissionModel[]}) { }

  ngOnInit() {
  }

  asMoment(date: Date): moment.Moment {
    return moment(date);
  }

  close() {
    this.dialogRef.close();
  }
}
