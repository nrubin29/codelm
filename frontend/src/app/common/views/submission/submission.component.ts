import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isGradedSubmission, SubmissionModel } from '../../../../../../common/src/models/submission.model';
import { SubmissionService } from '../../../services/submission.service';
import { TeamService } from '../../../services/team.service';
import { ProblemUtil } from '../../../../../../common/src/utils/problem.util';

@Component({
  selector: 'app-result',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss']
})
export class SubmissionComponent implements OnInit {
  submission: SubmissionModel;
  problemNumber: number;

  constructor(private submissionService: SubmissionService, private teamService: TeamService, private router: Router, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.submission = data['submission'];
      this.problemNumber = ProblemUtil.getProblemNumberForTeam(this.submission.problem, this.submission.team);
    });
  }

  get isGradedSubmission() {
    return isGradedSubmission(this.submission);
  }

  delete() {
    this.submissionService.deleteSubmission(this.submission._id).then(() => {
      this.router.navigate(['/admin', 'team', this.submission.team._id]);
    }).catch(alert);
  }

  get admin() {
    return !this.teamService.team.getValue();
  }
}
