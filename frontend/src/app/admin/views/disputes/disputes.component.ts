import { Component, OnInit } from '@angular/core';
import { ProblemService } from '../../../services/problem.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SubmissionModel } from '../../../../../../common/src/models/submission.model';

@Component({
  selector: 'app-disputes',
  templateUrl: './disputes.component.html',
  styleUrls: ['./disputes.component.scss']
})
export class DisputesComponent implements OnInit {
  submissions: SubmissionModel[];

  constructor(private problemService: ProblemService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.submissions = data['disputes'];
    });
  }
}