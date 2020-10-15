import { Component, OnInit } from '@angular/core';
import { TeamModel } from '../../../../../../common/src/models/team.model';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from '../../../services/team.service';
import { SubmissionModel } from '../../../../../../common/src/models/submission.model';
import { ProblemModel } from '../../../../../../common/src/models/problem.model';
import { ProblemService } from '../../../services/problem.service';
import { format, parseJSON } from 'date-fns';
import { TeamUtil } from '../../../../../../common/src/utils/team.util';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent implements OnInit {
  team: TeamModel;
  problems: ProblemModel[] = [];
  problemSubmissions: { [problemId: string]: SubmissionModel[] } = {};

  // TODO: Change/reset password

  constructor(
    private teamService: TeamService,
    private problemService: ProblemService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      [this.team, this.problems] = data['team'];
      const submissions = data['submissions'];
      for (let problem of this.problems) {
        this.problemSubmissions[problem._id] = submissions.filter(
          submission => submission.problem._id === problem._id
        );
      }
    });
  }

  get members() {
    return TeamUtil.getName(this.team);
  }

  formatDate(date: string): string {
    return format(parseJSON(date), 'MMM d, h:mm:ss a');
  }
}
