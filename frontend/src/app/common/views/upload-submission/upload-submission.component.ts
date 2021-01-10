import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { SubmissionComponent } from '../submission/submission.component';
import { UploadSubmissionModel } from '@codelm/common/src/models/submission.model';
import { SubmissionService } from '../../../services/submission.service';
import { CodeMirrorComponent } from '../../components/code-mirror/code-mirror.component';
import { CodeSaverService } from '../../../services/code-saver.service';
import { Router } from '@angular/router';
import { ProblemService } from '../../../services/problem.service';
import { MatRadioButton } from '@angular/material/radio';
import { rubric } from './rubric';
import { LANGUAGES } from '@codelm/common/src/language';

@Component({
  selector: 'app-upload-submission',
  templateUrl: './upload-submission.component.html',
  styleUrls: ['./upload-submission.component.scss'],
})
export class UploadSubmissionComponent implements OnInit, AfterViewInit {
  @Input() submission: UploadSubmissionModel;
  mode: string;
  rubric = rubric;

  @ViewChild(CodeMirrorComponent, { static: true })
  codeMirror: CodeMirrorComponent;
  @ViewChildren(MatRadioButton) buttons: QueryList<MatRadioButton>;

  constructor(
    private submissionComponent: SubmissionComponent,
    private submissionService: SubmissionService,
    private problemService: ProblemService,
    private codeSaverService: CodeSaverService,
    private router: Router
  ) {}

  ngOnInit() {
    this.mode = LANGUAGES[this.submission.language].codeMirrorMode;
    this.codeMirror.writeValue(this.submission.code);
  }

  ngAfterViewInit() {
    this.buttons.forEach(button => {
      if (button.value === this.submission.rubric.get(button.name)) {
        button.checked = true;
      }
    });
  }

  setScore() {
    this.submission.rubric = new Map<string, number>(
      this.buttons
        .filter(button => button.checked)
        .map(button => [button.name, button.value])
    );
    this.submissionService
      .updateSubmission(this.submission)
      .then(submission => {
        this.submission = submission as UploadSubmissionModel;
        alert('Updated');
      })
      .catch(alert);
  }

  replay() {
    this.problemService.replayRequest = {
      _id: this.submission._id,
    };

    this.router.navigate(['admin', 'game', this.submission.problem.gameType]);
  }

  delete() {
    this.submissionComponent.delete();
  }

  get admin() {
    return this.submissionComponent.admin;
  }
}
