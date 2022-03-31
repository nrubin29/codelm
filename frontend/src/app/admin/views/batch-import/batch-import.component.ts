import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DivisionModel,
  DivisionType,
} from '@codelm/common/src/models/division.model';
import { TeamService } from '../../../services/team.service';
import { customAlphabet } from 'nanoid';
import { PersonService } from '../../../services/person.service';
import { bufferCount, filter, map, of } from 'rxjs';
import * as Papa from 'papaparse';
import { GroupModel } from '@codelm/common/src/models/group.model';
import { GroupService } from '../../../services/group.service';
import {
  PersonExperience,
  PersonModel,
} from '@codelm/common/src/models/person.model';

type AddedPerson = [person: PersonModel, password: string];

interface InputCsvRow {
  schoolName: string;
  intermediateTeams: string[][];
  advancedTeams: string[][];
  expertTeams: string[][];
}

interface OutputCsvRow {
  school: string;
  division: string;
  index: number;
  name: string;
  username: string;
  password: string;
}

@Component({
  selector: 'app-batch-import',
  templateUrl: './batch-import.component.html',
  styleUrls: ['./batch-import.component.scss'],
})
export class BatchImportComponent implements OnInit {
  divisions: DivisionModel[];
  groups: GroupModel[];
  data: InputCsvRow[];

  successes: OutputCsvRow[];
  finished = false;

  @ViewChild('a') a: ElementRef;

  static generator = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    6,
  );

  constructor(
    private activatedRoute: ActivatedRoute,
    private groupService: GroupService,
    private personService: PersonService,
    private teamService: TeamService,
  ) {}

  ngOnInit() {
    this.divisions = this.activatedRoute.snapshot.data.divisions;
    this.groups = this.activatedRoute.snapshot.data.groups;
  }

  async handleFile(data: string) {
    const rows = Papa.parse<Record<string, string>>(data, {
      header: true,
    }).data;

    this.data = await Promise.all(
      rows.map(async row => ({
        schoolName: row['Teacher School'],
        intermediateTeams: await BatchImportComponent.parseList(
          row['Intermediate Team Members'],
        ),
        advancedTeams: await BatchImportComponent.parseList(
          row['Advanced Team Members'],
        ),
        expertTeams: await BatchImportComponent.parseList(
          row['Expert Team Members'],
        ),
      })),
    );
  }

  private static parseList(str: string): Promise<string[][]> {
    const observable = of(
      ...str
        .replace(/[^a-zA-Z' \n]/g, '')
        .replace(/[\r\n]/g, ' ')
        .replace(/ +/g, ' ')
        .split(' '),
    ).pipe(
      // [firstName, lastName]
      bufferCount(2),
      // Join to '$firstName $lastName'
      map(value => value.join(' ')),
      // 3 members per team
      bufferCount(3),
      // Ignore empty teams
      filter(team => team.length > 1 || team[0] !== ''),
    );

    return new Promise<string[][]>((resolve, reject) => {
      const _value: string[][] = [];
      observable.subscribe({
        next: value => {
          _value.push(value);
        },
        error: reject,
        complete: () => {
          resolve(_value);
        },
      });
    });
  }

  async upload() {
    this.successes = [];
    const usernames = new Set<string>();

    for (const row of this.data) {
      let group = this.groups.find(group => group.name === row.schoolName);

      if (!group) {
        group = await this.groupService.addOrUpdate({
          name: row.schoolName,
          special: false,
        });
      }

      await Promise.all([
        this.addDivision(
          group,
          PersonExperience.Intermediate,
          row.intermediateTeams,
          usernames,
        ),
        this.addDivision(
          group,
          PersonExperience.Advanced,
          row.advancedTeams,
          usernames,
        ),
        this.addDivision(
          group,
          PersonExperience.Expert,
          row.expertTeams,
          usernames,
        ),
      ]);
    }

    this.finished = true;
  }

  async addDivision(
    group: GroupModel,
    experience: PersonExperience,
    teams: string[][],
    usernames: Set<string>,
  ) {
    const division = this.divisions.find(
      div =>
        div.type == DivisionType.Competition && div.experience == experience,
    );

    for (let i = 0; i < teams.length; i++) {
      const teamMembers = teams[i];
      const people = await Promise.all(
        teamMembers.map(person =>
          this.addPerson(person, group, division, experience, usernames),
        ),
      );

      await this.teamService.addOrUpdate({
        members: people.map(person => person[0]),
        division: division,
      });

      this.successes.push(
        ...people.map(
          person =>
            ({
              school: person[0].group.name,
              division: person[0].experience,
              index: i,
              name: person[0].name,
              username: person[0].username,
              password: person[1],
            } as OutputCsvRow),
        ),
      );
    }
  }

  async addPerson(
    name: string,
    group: GroupModel,
    division: DivisionModel,
    experience: PersonExperience,
    usernames: Set<string>,
  ): Promise<AddedPerson> {
    const [firstName, lastName] = name.replace(/'/g, '').split(' ');
    let username: string;
    let i = 1;

    do {
      username = (
        firstName.substring(0, i++) + lastName.substring(0, 6)
      ).toLowerCase();
    } while (usernames.has(username));

    const password = BatchImportComponent.generator();
    usernames.add(username);

    return [
      await this.personService.addOrUpdate({
        name,
        experience,
        group,
        username,
        password,
      }),
      password,
    ];
  }

  download() {
    const headerRow = [
      'School',
      'Division',
      'Team Index',
      'Name',
      'Username',
      'Password',
    ];
    const rows = this.successes.map(row => Object.values(row).join(','));
    const data = [headerRow, ...rows].join('\n');
    this.a.nativeElement.href =
      'data:application/octet-stream,' + encodeURIComponent(data);
    this.a.nativeElement.click();
  }
}
