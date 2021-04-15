import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TeamModel } from '@codelm/common/src/models/team.model';
import { TeamService } from '../../../services/team.service';
import { ProblemService } from '../../../services/problem.service';
import { LANGUAGES } from '@codelm/common/src/language';
import * as JSZip from 'jszip';
import { CodegenUtils } from '@codelm/common/src/codegen/utils';
import {
  GradedProblemModel,
  isGradedProblem,
} from '@codelm/common/src/models/problem.model';

@Component({
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.scss'],
})
export class StandingsComponent implements OnInit {
  team: TeamModel;

  @ViewChild('download') downloadLink: ElementRef<HTMLAnchorElement>;

  constructor(
    private teamService: TeamService,
    private problemService: ProblemService
  ) {}

  ngOnInit() {
    this.teamService.team.subscribe(team => {
      this.team = team;
    });
  }

  async downloadStarterCode() {
    const problems = await this.problemService.getProblems(
      this.team.division._id
    );

    const zip = new JSZip();

    for (const language of Object.values(LANGUAGES)) {
      for (const problem of problems) {
        zip.file(
          CodegenUtils.toPascalCase(language.name) +
            '/' +
            language.fileName(problem.title) +
            '.' +
            language.extension,
          language.codegen(problem as GradedProblemModel).generate()
        );
      }
    }

    for (const problem of problems.filter(isGradedProblem)) {
      zip.file(
        `Sample Data/${CodegenUtils.toPascalCase(problem.title)}.txt`,
        problem.testCases
          .map(
            testCase =>
              `Input:\n${testCase.input}\n\nOutput:\n${testCase.output}`
          )
          .join('\n\n=====\n\n')
      );
    }

    const zipData = await zip.generateAsync({ type: 'blob' });
    this.downloadLink.nativeElement.href = URL.createObjectURL(zipData);
    this.downloadLink.nativeElement.click();
  }

  get members() {
    return this.team.members.map(member => member.name).join(', ');
  }
}
