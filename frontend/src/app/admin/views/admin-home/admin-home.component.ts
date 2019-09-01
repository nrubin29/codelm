import { Component, OnInit } from '@angular/core';
import { DivisionModel } from '../../../../../../common/src/models/division.model';
import { DivisionService } from '../../../services/division.service';
import {SubmissionService} from "../../../services/submission.service";

// TODO: Use a resolve.

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent implements OnInit {
  divisions: DivisionModel[] = [];
  groupedSubmissions: object;

  // TODO: Add an "overall" tab (for easy filtering)
  // TODO: Show loading indicator while data is being loaded

  constructor(private divisionService: DivisionService, private submissionService: SubmissionService) { }

  ngOnInit() {
    this.divisionService.getDivisions().then(divisions => {
      this.divisions = divisions;

      this.submissionService.getSubmissionsGrouped().then(groupedSubmissions => {
        this.groupedSubmissions = groupedSubmissions;
      });
    });

    setInterval(() => {
      this.submissionService.getSubmissionsGrouped().then(groupedSubmissions => {
        this.groupedSubmissions = groupedSubmissions;
      });
    }, 120 * 1000);
  }
}
