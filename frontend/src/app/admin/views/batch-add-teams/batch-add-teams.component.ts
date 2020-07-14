import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DivisionModel } from '../../../../../../common/src/models/division.model';
import { TeamService } from '../../../services/team.service';
import { customAlphabet } from 'nanoid';

interface TeamCsv {
  timestamp: string;
  school: string;
  name: string;
  email: string;
  year: string;
  division: DivisionModel;
  divisionName: string;
  username?: string;
  password?: string;
}

// TODO: This component is not compatible with the Person/Group update and can probably be deleted.
@Component({
  selector: 'app-batch-add-teams',
  templateUrl: './batch-add-teams.component.html',
  styleUrls: ['./batch-add-teams.component.scss'],
})
export class BatchAddTeamsComponent implements OnInit {
  divisions: DivisionModel[];
  data: TeamCsv[];

  successes: TeamCsv[];
  errors: TeamCsv[];
  finished = false;

  @ViewChild('a') a: ElementRef;

  constructor(
    private activatedRoute: ActivatedRoute,
    private teamService: TeamService
  ) {}

  ngOnInit() {
    this.divisions = this.activatedRoute.snapshot.data.divisions;
  }

  handleFile(data: string) {
    const rows = data.split('\n').map(row => row.trim().split(','));
    const headerRow = rows.splice(0, 1)[0];

    this.data = rows.map(row => ({
      timestamp: row[headerRow.indexOf('Timestamp')],
      school: row[headerRow.indexOf('School')],
      name: row[headerRow.indexOf("Student's Full Name")],
      email: row[headerRow.indexOf("Student's Email Address")],
      year: row[headerRow.indexOf("Student's year")],
      division: this.divisions.find(
        division => division.name === row[headerRow.indexOf('Division')]
      ),
      divisionName: row[headerRow.indexOf('Division')],
    }));
  }

  async upload() {
    const generator = customAlphabet(
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      6
    );
    this.errors = [];
    this.successes = [];
    const usernames = new Set<string>();

    for (const team of this.data) {
      const name = team.name.trim().split(' ');
      team.username = (
        name[0][0] + name[name.length - 1].substring(0, 6)
      ).toLowerCase();
      team.password = generator();

      if (usernames.has(team.username)) {
        this.errors.push(team);
      } else {
        usernames.add(team.username);

        await this.teamService.addOrUpdate({
          username: team.username,
          password: team.password,
          members: undefined, // was team.name
          division: team.division,
          salt: undefined,
        });

        this.successes.push(team);
      }
    }

    this.finished = true;
  }

  download() {
    const data = this.successes
      .map(team =>
        Object.keys(team)
          .filter(key => key !== 'division')
          .map(key => team[key])
          .join(',')
      )
      .join('\n');
    this.a.nativeElement.href =
      'data:application/octet-stream,' + encodeURIComponent(data);
    this.a.nativeElement.click();
  }

  get hasError() {
    return this.data.find(team => !team.division);
  }
}
