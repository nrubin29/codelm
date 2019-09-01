import {Component, Input, OnInit, ViewChild} from '@angular/core';
import { SubmissionComponent } from '../submission/submission.component';
import { UploadSubmissionModel } from '../../../../../../common/src/models/submission.model';
import { SubmissionService } from '../../../services/submission.service';
import {CodeMirrorComponent} from "../../components/code-mirror/code-mirror.component";
import {CodeSaverService} from "../../../services/code-saver.service";
import {OpenEndedProblemModel} from "../../../../../../common/src/models/problem.model";
import {Router} from "@angular/router";
import {ProblemService} from "../../../services/problem.service";

@Component({
  selector: 'app-upload-submission',
  templateUrl: './upload-submission.component.html',
  styleUrls: ['./upload-submission.component.scss']
})
export class UploadSubmissionComponent implements OnInit {
  @Input() submission: UploadSubmissionModel;
  score: number;

  mode: string;
  @ViewChild(CodeMirrorComponent, {static: true}) codeMirror: CodeMirrorComponent;

  constructor(private submissionComponent: SubmissionComponent, private submissionService: SubmissionService, private problemService: ProblemService, private codeSaverService: CodeSaverService, private router: Router) {
  }

  ngOnInit() {
    this.mode = this.codeSaverService.getMode(this.submission.language);
    this.codeMirror.writeValue(this.submission.code);
  }

  setScore() {
    this.submission.score = this.score;
    this.submissionService.updateSubmission(this.submission).then(() => {
      this.submission.points = this.score;
      alert('Updated');
    }).catch(alert);
  }

  replay() {
    this.problemService.replayRequest = {
      _id: this.submission._id
    };

    this.router.navigate(['admin', 'game', (<OpenEndedProblemModel>this.submission.problem).game.toLowerCase().replace(' ', '')]);
  }

  delete() {
    this.submissionComponent.delete();
  }

  get admin() {
    return this.submissionComponent.admin;
  }
}
