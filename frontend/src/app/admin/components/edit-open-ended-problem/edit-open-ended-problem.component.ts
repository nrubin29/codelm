import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup} from "@angular/forms";
import {OpenEndedProblemModel} from "../../../../../../common/src/models/problem.model";
import {Game} from "../../../../../../common/src/models/game.model";

@Component({
  selector: 'app-edit-open-ended-problem',
  templateUrl: './edit-open-ended-problem.component.html',
  styleUrls: ['./edit-open-ended-problem.component.scss']
})
export class EditOpenEndedProblemComponent implements OnInit, OnDestroy {
  @Input() mainFormGroup: FormGroup;
  @Input() openEndedProblem: OpenEndedProblemModel;

  controls: {[name: string]: AbstractControl};

  // TODO: Support extras

  constructor() {
  }

  ngOnInit() {
    this.controls = {
      game: new FormControl(this.openEndedProblem.game)
    };

    Object.keys(this.controls).forEach(key => this.mainFormGroup.addControl(key, this.controls[key]));
  }

  ngOnDestroy() {
    Object.keys(this.controls).forEach(key => this.mainFormGroup.removeControl(key));
  }

  get games() {
    return Object.keys(Game).map(key => Game[key]);
  }
}
