import {AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
  isGradedProblem,
  OpenEndedProblemModel,
  ProblemModel
} from '../../../../../../common/src/models/problem.model';
import {ProblemService} from '../../../services/problem.service';
import {SubmissionModel} from '../../../../../../common/src/models/submission.model';
import {TeamService} from '../../../services/team.service';
import {TeamModel} from '../../../../../../common/src/models/team.model';
import {CodeSaverService} from '../../../services/code-saver.service';
import {ProblemUtil} from '../../../../../../common/src/utils/problem.util';
import {CodeMirrorComponent} from "../../../common/components/code-mirror/code-mirror.component";
import {ClientProblemSubmission} from "../../../../../../common/src/problem-submission";
import {debounceTime} from "rxjs/operators";

@Component({
  selector: 'app-problem',
  templateUrl: './problem.component.html',
  styleUrls: ['./problem.component.scss']
})
export class ProblemComponent implements OnInit, AfterViewInit, OnDestroy {
  team: TeamModel;
  problem: ProblemModel;
  submissions: SubmissionModel[] = [];

  problemNumber: number;
  problemPoints: number;

  @ViewChildren(CodeMirrorComponent) codeMirrors: QueryList<CodeMirrorComponent>;
  language: string;

  constructor(private problemService: ProblemService, private teamService: TeamService, private codeSaverService: CodeSaverService, private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.teamService.team.subscribe(team => this.team = team);

    this.activatedRoute.data.subscribe(data => {
      this.problem = data['problem'];
      this.submissions = data['submissions'].filter(submission => submission.problem._id === this.problem._id);
      this.problemNumber = ProblemUtil.getProblemNumberForTeam(this.problem, this.team);
      this.problemPoints = ProblemUtil.getPoints(this.problem, this.team);
    });

    this.language = this.codeSaverService.getLanguage();
  }

  ngAfterViewInit() {
    this.subscribeTo(this.codeMirrors.first);

    this.codeMirrors.changes.subscribe((codeMirrors: QueryList<CodeMirrorComponent>) => {
      codeMirrors.forEach(cm => this.subscribeTo(cm));
    });
  }

  private subscribeTo(codeMirror: CodeMirrorComponent) {
    codeMirror.writeValue(this.codeSaverService.get(this.problem._id, codeMirror.config.mode));
    codeMirror.change.pipe(debounceTime(5000)).subscribe(() => {
      this.saveCode();
    });
  }

  ngOnDestroy() {
    // TODO: For some reason, when there are two open-ended problems, switching between them directly reuses the component,
    //  and so ngOnDestroy() and ngAfterViewInit() aren't called, and the code from the first problem stays in the second
    //  problem's box and then it causes headaches.
    this.saveCode();
  }

  get isGraded() {
    return isGradedProblem(this.problem);
  }

  saveCode() {
    this.codeSaverService.save(this.problem._id, this.codeMirrors.first.config.mode, this.codeMirrors.first.value);
  }

  get documentation() {
    return this.codeSaverService.getDocumentation();
  }

  submitClicked(test: boolean) {
    this.saveCode();

    this.problemService.problemSubmission = {
      problemId: this.problem._id,
      language: this.language,
      code: this.codeMirrors.first.value,
      test: test
    };

    if (!test || isGradedProblem(this.problem)) {
      this.router.navigate(['dashboard', 'submit']);
    }

    else {
      this.router.navigate(['dashboard', 'game', (<OpenEndedProblemModel>this.problem).game.toLowerCase().replace(' ', '')]);
    }
  }
}
