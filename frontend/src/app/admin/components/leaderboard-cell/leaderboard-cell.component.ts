import { Component, Input } from '@angular/core';
import {
  SubmissionOverviewElement,
  SubmissionOverviewStatus,
} from '@codelm/common/src/models/submission.model';
import { ProblemModel } from '@codelm/common/src/models/problem.model';
import { ViewSubmissionsComponent } from '../view-submissions/view-submissions.component';
import { MatDialog } from '@angular/material/dialog';

// TODO: Incorporate disputes (yellow background + ! icon)

@Component({
  selector: 'app-leaderboard-cell',
  templateUrl: './leaderboard-cell.component.html',
  styleUrls: ['./leaderboard-cell.component.scss'],
})
export class LeaderboardCellComponent {
  @Input() element: SubmissionOverviewElement;
  @Input() problem: ProblemModel;

  constructor(private dialog: MatDialog) {}

  isComplete() {
    return (
      this.element.problems[this.problem._id].status ===
      SubmissionOverviewStatus.Complete
    );
  }

  isError() {
    return (
      this.element.problems[this.problem._id].status ===
      SubmissionOverviewStatus.Error
    );
  }

  isIncomplete() {
    return (
      this.element.problems[this.problem._id].status ===
        SubmissionOverviewStatus.None &&
      this.element.problems[this.problem._id].numSubmissions > 0
    );
  }

  onClick() {
    if (this.element.problems[this.problem._id].numSubmissions === 0) {
      return;
    }

    this.dialog.open(ViewSubmissionsComponent, {
      data: {
        problem: this.problem,
        team: this.element.team,
      },
      width: '640px',
    });
  }
}
