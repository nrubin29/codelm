import { Component, OnInit } from '@angular/core';
import { DivisionModel } from '../../../../../../common/src/models/division.model';
import { DivisionService } from '../../../services/division.service';
import {SubmissionService} from "../../../services/submission.service";

// TODO: Use a resolve.

@Component({
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.scss']
})
export class StandingsComponent implements OnInit {
  divisions: DivisionModel[] = [];

  // TODO: Add an "overall" tab (for easy filtering)
  // TODO: Show loading indicator while data is being loaded

  constructor(private divisionService: DivisionService, private submissionService: SubmissionService) { }

  ngOnInit() {
    this.divisionService.getAll().then(divisions => {
      this.divisions = divisions;
    });
  }
}
