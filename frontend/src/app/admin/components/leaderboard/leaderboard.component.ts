import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DivisionModel} from '../../../../../../common/src/models/division.model';
import {TeamService} from '../../../services/team.service';
import {SubmissionService} from "../../../services/submission.service";
import {ProblemModel} from "../../../../../../common/src/models/problem.model";
import {ProblemService} from "../../../services/problem.service";
import {
  SubmissionOverview,
  SubmissionOverviewElement,
  SubmissionOverviewStatus
} from "../../../../../../common/src/models/submission.model";
import {MatDialog} from "@angular/material";
import {ViewSubmissionsComponent} from "../view-submissions/view-submissions.component";

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  @Input() division: DivisionModel;

  submissionOverview: SubmissionOverview;
  problems: ProblemModel[] = [];

  intervalHandle: number;

  // TODO: Add filtering
  // TODO: Incorporate disputes (yellow background + ! icon)

  constructor(private teamService: TeamService, private problemService: ProblemService, private submissionService: SubmissionService, private dialog: MatDialog) { }

  ngOnInit() {
    this.problemService.getProblems(this.division._id).then(problems => this.problems = problems);

    this.refresh();
    this.intervalHandle = setInterval(this.refresh.bind(this), 30 * 1000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalHandle);
  }

  refresh() {
    this.submissionService.getSubmissionOverview(this.division._id).then(overview => this.submissionOverview = overview);
  }

  get columns() {
    return ['team', /*'members',*/ 'score'].concat(...this.problems.map(problem => problem._id));
  }

  shortenUsername(username: string) {
    return username.replace(/Junior|Senior|Upper/g, '');
  }

  style(element: SubmissionOverviewElement, problem: ProblemModel) {
    // TODO: Make three classes and apply the correct class.

    const stat = element.problems[problem._id].status;
    const background = element.problems[problem._id].numSubmissions === 0 ? 'white' :
      stat === SubmissionOverviewStatus.Complete ? 'lightgreen' :
      stat === SubmissionOverviewStatus.Error ? '#ef3d47' : 'lightgray';

    return {
      'background-color': background,
      'color': background === '#ef3d47' ? 'white' : 'black'
    };
  }

  onCellClick(element: SubmissionOverviewElement, problem: ProblemModel) {
    if (element.problems[problem._id].numSubmissions === 0) {
      return;
    }

    this.dialog.open(ViewSubmissionsComponent, {
      data: {
        problem: problem,
        team: element.team
      },
      width: '640px'
    });
  }
}
