import { Component, OnInit } from '@angular/core';
import { TeamModel } from '../../../../../../common/src/models/team.model';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from '../../../services/team.service';
import { SubmissionModel } from '../../../../../../common/src/models/submission.model';
import { ProblemModel } from '../../../../../../common/src/models/problem.model';
import { ProblemService } from '../../../services/problem.service';
import * as moment from 'moment';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  team: TeamModel;
  problems: ProblemModel[] = [];
  problemSubmissions: {[problemId: string]: SubmissionModel[]} = {};

  // TODO: Change/reset password

  constructor(private teamService: TeamService, private problemService: ProblemService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      const teamAndProblems = data['team'];
      const submissions = data['submissions'];
      this.team = teamAndProblems[0];
      this.problems = teamAndProblems[1];
      for (let problem of this.problems) {
        this.problemSubmissions[problem._id] = submissions.filter(submission => submission.problem._id === problem._id);
      }
    });
  }

  asMoment(date: Date): moment.Moment {
    return moment(date);
  }
}
