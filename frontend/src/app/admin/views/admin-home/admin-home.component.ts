import { Component, OnInit } from '@angular/core';
import { DivisionModel } from '../../../../../../common/src/models/division.model';
import { DivisionService } from '../../../services/division.service';
import {SubmissionService} from "../../../services/submission.service";
import {GroupedSubmissions, SubmissionModel} from "../../../../../../common/src/models/submission.model";

// TODO: Use a resolve.

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent implements OnInit {
  divisions: DivisionModel[] = [];
  groupedSubmissions: GroupedSubmissions;

  // TODO: Add an "overall" tab (for easy filtering)
  // TODO: Show loading indicator while data is being loaded

  constructor(private divisionService: DivisionService, private submissionService: SubmissionService) { }

  ngOnInit() {
    this.divisionService.getDivisions().then(divisions => {
      this.divisions = divisions;

      // this.submissionService.getSubmissionsGrouped().then(groupedSubmissions => {
      //   this.groupedSubmissions = groupedSubmissions;
      // });

      // noinspection JSIgnoredPromiseFromCall
      this.update();

      setInterval(() => {
        // noinspection JSIgnoredPromiseFromCall
        this.update();
        // this.submissionService.getSubmissionsGrouped().then(groupedSubmissions => {
        //   this.groupedSubmissions = groupedSubmissions;
        // });
      }, 120 * 1000);
    });
  }

  async update() {
      const result: GroupedSubmissions = {};
      const submissions: SubmissionModel[] = await this.submissionService.getAllSubmissions();

      for (let submission of submissions) {
        if (!submission.team || !submission.problem) {
          console.error('Bad/stale submission: ' + submission._id);
          continue;
        }

        console.log(`Trying submission ${submission._id}`);

        const divisionId = submission.team.division._id;
        const teamId = submission.team._id;
        const problemId = submission.problem._id;

        if (!(divisionId in result)) {
          result[divisionId] = {};
        }

        if (!(teamId in result[divisionId])) {
          result[divisionId][teamId] = {};
        }

        if (!(problemId in result[divisionId][teamId])) {
          result[divisionId][teamId][problemId] = [submission];
        }

        else {
          result[divisionId][teamId][problemId].push(submission);
        }
      }

      this.groupedSubmissions = result;
  }
}
