import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { GradedSubmissionModel } from '@codelm/common/src/models/submission.model';
import { CodeMirrorComponent } from '../../components/code-mirror/code-mirror.component';
import { SubmissionService } from '../../../services/submission.service';
import { CodeSaverService } from '../../../services/code-saver.service';
import { SubmissionComponent } from '../submission/submission.component';
import { SubmissionUtil } from '@codelm/common/src/utils/submission.util';
import { TeamUtil } from '@codelm/common/src/utils/team.util';
import { LANGUAGES } from '@codelm/common/src/language';

@Component({
  selector: 'app-graded-submission',
  templateUrl: './graded-submission.component.html',
  styleUrls: ['./graded-submission.component.scss'],
})
export class GradedSubmissionComponent implements OnInit {
  @Input() submission: GradedSubmissionModel;

  mode: string;
  @ViewChild(CodeMirrorComponent, { static: true })
  codeMirror: CodeMirrorComponent;

  disputeMessage: string;

  constructor(
    private submissionComponent: SubmissionComponent,
    private submissionService: SubmissionService,
    private codeSaverService: CodeSaverService
  ) {}

  ngOnInit() {
    this.mode = LANGUAGES[this.submission.language].codeMirrorMode;
    this.codeMirror.writeValue(this.submission.code);
  }

  get hasError() {
    return SubmissionUtil.hasError(this.submission);
  }

  get submissionError() {
    const error =
      this.submission.compilationError ??
      this.submission.testCases.find(testCase => testCase.error !== undefined)
        .error;
    return error.replace(/\n/g, '<br />');
  }

  overrideCorrect() {
    const submission = { ...this.submission } as GradedSubmissionModel;
    submission.overrideCorrect = !submission.overrideCorrect;
    this.submissionService
      .updateSubmission(submission)
      .then(s => {
        this.submission = <GradedSubmissionModel>s;
      })
      .catch(alert);
  }

  sendDispute() {
    if (!this.disputeMessage) {
      alert('Please provide a message explaining your dispute.');
    }

    const submission = { ...this.submission } as GradedSubmissionModel;
    submission.dispute = {
      open: true,
      message: this.disputeMessage,
    };

    this.submissionService
      .updateSubmission(submission)
      .then(s => {
        this.submission = <GradedSubmissionModel>s;
      })
      .catch(alert);
  }

  resolveDispute() {
    const submission = { ...this.submission } as GradedSubmissionModel;
    submission.dispute.open = false;

    this.submissionService
      .updateSubmission(submission)
      .then(s => {
        this.submission = <GradedSubmissionModel>s;
      })
      .catch(alert);
  }

  delete() {
    this.submissionComponent.delete();
  }

  get admin() {
    return this.submissionComponent.admin;
  }

  get members() {
    return TeamUtil.getName(this.submission.team);
  }
}
