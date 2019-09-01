import { Component, Input, OnInit } from '@angular/core';
import { DivisionModel } from '../../../../../../common/src/models/division.model';
import { TeamModel } from '../../../../../../common/src/models/team.model';
import { TeamService } from '../../../services/team.service';
import {SubmissionService} from "../../../services/submission.service";
import {ProblemModel, ProblemType} from "../../../../../../common/src/models/problem.model";
import {ProblemService} from "../../../services/problem.service";
import {SubmissionModel} from "../../../../../../common/src/models/submission.model";
import {MatDialog} from "@angular/material";
import {ViewSubmissionsComponent} from "../view-submissions/view-submissions.component";

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  @Input() division: DivisionModel;
  @Input() groupedSubmissions: object;

  teams: TeamModel[] = [];
  problems: ProblemModel[] = [];

  // TODO: Add filtering
  // TODO: Make the points column sortable
  // TODO: Clean up this code
  // TODO: Incorporate disputes (yellow background + ! icon)

  constructor(private teamService: TeamService, private problemService: ProblemService, private submissionService: SubmissionService, private dialog: MatDialog) { }

  ngOnInit() {
    this.teamService.getTeamsForDivision(this.division._id).then(teams => this.teams = teams.sort(((a, b) => b.score - a.score)));
    this.problemService.getProblems(this.division._id).then(problems => this.problems = problems);
  }

  get columns() {
    return ['team', /*'members',*/ 'score'].concat(...this.problems.map(problem => problem._id));
  }

  get tableData() {
    return this.teams.filter(team => team._id in this.groupedSubmissions).map(team => Object.assign({team: Object.assign(team, {username: team.username.replace(/Junior|Senior|Upper/g, '')})}, ...Object.keys(this.groupedSubmissions[team._id]).map(problemId => ({[problemId]: this.groupedSubmissions[team._id][problemId]}))));
  }

  status(submissions: SubmissionModel[]) {
    if (!submissions) {
      return 'none';
    }

    let error = false;

    for (let submission of submissions) {
      if (submission.points > 0) {
        return 'complete';
      }

      else if (submission.problem.type === ProblemType.OpenEnded && !submission.test) {
        return 'complete';
      }

      else if (!submission.test) {
        error = true;
      }
    }

    return error ? 'error' : 'none';
  }

  style(submissions: SubmissionModel[]) {
    if (!submissions || submissions.length < 1) {
      return {};
    }

    // TODO: Make three classes and apply the correct class.
    const stat = this.status(submissions);
    const background = stat === 'complete' ? 'lightgreen' : stat === 'error' ? '#ef3d47' : 'lightgray';
    return {
      'background-color': background,
      'color': background === '#ef3d47' ? 'white' : 'black'
    };
  }

  onCellClick(problem: ProblemModel, submissions: SubmissionModel[]) {
    if (!submissions || submissions.length < 1) {
      return;
    }

    this.dialog.open(ViewSubmissionsComponent, {
      data: {
        problem: problem,
        team: submissions[0].team,
        submissions: submissions.slice().reverse()
      },
      width: '640px'
    });
  }
}
