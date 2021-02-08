import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  isGradedProblem,
  OpenEndedProblemModel,
  ProblemModel,
} from '@codelm/common/src/models/problem.model';
import { ProblemService } from '../../../services/problem.service';
import { SubmissionModel } from '@codelm/common/src/models/submission.model';
import { TeamService } from '../../../services/team.service';
import { TeamModel } from '@codelm/common/src/models/team.model';
import { CodeSaverService } from '../../../services/code-saver.service';
import { ProblemUtil } from '@codelm/common/src/utils/problem.util';
import { CodeMirrorComponent } from '../../../common/components/code-mirror/code-mirror.component';
import { debounceTime } from 'rxjs/operators';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-problem',
  templateUrl: './problem.component.html',
  styleUrls: ['./problem.component.scss'],
})
export class ProblemComponent implements OnInit, AfterViewInit, OnDestroy {
  team: TeamModel;
  problem: ProblemModel;
  submissions: SubmissionModel[] = [];

  problemNumber: number;
  problemPoints: number;

  @ViewChildren(CodeMirrorComponent) codeMirrors: QueryList<
    CodeMirrorComponent
  >;
  codeEntryMode: string;
  language: string;
  documentationUrl: string;
  fileExtension: string;

  code = new BehaviorSubject<string>('');

  constructor(
    private problemService: ProblemService,
    private teamService: TeamService,
    private codeSaverService: CodeSaverService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.teamService.team.subscribe(team => (this.team = team));

    this.activatedRoute.data.subscribe(data => {
      if (this.codeMirrors !== undefined) {
        /*
        Angular will reuse the same problem component if we navigate directly between two problems. Thus, we need to
        call ngOnDestroy() and ngAfterViewInit() manually whenever the problem changes. When the component is first
        initialized, this.codeMirrors will be undefined, which is good because Angular will just call ngAfterViewInit()
        when it's ready. For all future problem changes, we have to call it manually.
         */
        this.ngOnDestroy();
      }

      this.problem = data.problem;
      this.submissions = data.submissions.filter(
        submission => submission.problem._id === this.problem._id
      );
      this.problemNumber = ProblemUtil.getProblemNumberForTeam(
        this.problem,
        this.team
      );
      this.problemPoints = ProblemUtil.getPoints(this.problem, this.team);
      this.documentationUrl = this.codeSaverService.getLanguage().documentationUrl;
      this.fileExtension = this.codeSaverService.getLanguage().extension;

      if (this.codeMirrors !== undefined) {
        this.ngAfterViewInit();
      }
    });

    this.language = this.codeSaverService.getLanguage().name;
    this.codeEntryMode = this.codeSaverService.getCodeEntryMode();
  }

  ngAfterViewInit() {
    if (this.codeMirrors.length > 0) {
      this.subscribeTo(this.codeMirrors.first);
    }

    this.codeMirrors.changes.subscribe(
      (codeMirrors: QueryList<CodeMirrorComponent>) => {
        codeMirrors.forEach(cm => this.subscribeTo(cm));
      }
    );
  }

  private subscribeTo(codeMirror: CodeMirrorComponent) {
    const code = this.codeSaverService.get(this.problem._id, codeMirror.mode);
    codeMirror.writeValue(code);
    this.code.next(code);

    codeMirror.change.subscribe(value => {
      this.code.next(value);
    });
    codeMirror.change.pipe(debounceTime(5000)).subscribe(() => {
      this.saveCode();
    });
  }

  onFileDropped(value: string) {
    this.code.next(value);
  }

  ngOnDestroy() {
    this.saveCode();
  }

  get isGraded() {
    return isGradedProblem(this.problem);
  }

  onCodeEntryModeChange(event: MatButtonToggleChange) {
    this.codeSaverService.setCodeEntryMode(event.value);
  }

  onLanguageChange(event: MatButtonToggleChange) {
    this.codeSaverService.setLanguage(event.value);
    this.documentationUrl = this.codeSaverService.getLanguage().documentationUrl;
    this.fileExtension = this.codeSaverService.getLanguage().extension;
    this.saveCode();
  }

  saveCode() {
    if (this.codeEntryMode === 'editor') {
      this.codeSaverService.save(
        this.problem._id,
        this.codeMirrors.first.mode,
        this.codeMirrors.first.value
      );
    }
  }

  submitClicked(test: boolean) {
    this.saveCode();

    this.problemService.problemSubmission = {
      problemId: this.problem._id,
      language: this.language,
      code: this.code.value,
      test: test,
    };

    if (!test || isGradedProblem(this.problem)) {
      this.router.navigate(['dashboard', 'submit']);
    } else {
      this.router.navigate([
        'dashboard',
        'game',
        (this.problem as OpenEndedProblemModel).gameType,
      ]);
    }
  }
}
