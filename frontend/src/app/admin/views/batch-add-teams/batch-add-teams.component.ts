import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DivisionModel} from '../../../../../../common/src/models/division.model';
import {TeamService} from '../../../services/team.service';

interface TeamCsv {
  timestamp: string;
  school: string;
  name: string;
  email: string;
  year: string;
  division: DivisionModel;
  divisionName: string;
}

@Component({
  selector: 'app-batch-add-teams',
  templateUrl: './batch-add-teams.component.html',
  styleUrls: ['./batch-add-teams.component.scss']
})
export class BatchAddTeamsComponent implements OnInit {
  divisions: DivisionModel[];
  data: TeamCsv[];

  constructor(private activatedRoute: ActivatedRoute, private teamService: TeamService) { }

  ngOnInit() {
    this.divisions = this.activatedRoute.snapshot.data.divisions;
  }

  handleFile(file: File) {
    const fileReader = new FileReader();

    fileReader.addEventListener('load', event => {
      const rows = (event.target.result as string).split('\n').map(row => row.trim().split(','));
      const headerRow = rows.splice(0, 1)[0];

      this.data = rows.map(row => ({
        timestamp: row[headerRow.indexOf('Timestamp')],
        school: row[headerRow.indexOf('School')],
        name: row[headerRow.indexOf('Student\'s Full Name')],
        email: row[headerRow.indexOf('Student\'s Email Address')],
        year: row[headerRow.indexOf('Student\'s year')],
        division: this.divisions.find(division => division.name === row[headerRow.indexOf('Division')]),
        divisionName: row[headerRow.indexOf('Division')],
      }));
    });

    fileReader.readAsText(file);
  }

  async upload() {
    // TODO: For each user, generate a username and password for them. Store this data and export it to a CSV file.

    // for (const team of this.data) {
    //   await this.teamService.addOrUpdate({
    //
    //   });
    // }
  }

  get hasError() {
    return this.data.find(team => !team.division);
  }
}
