import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { GradedProblemModel, TestCaseModel, TestCaseOutputMode } from '../../../../../../common/src/models/problem.model';
import {AbstractControl, FormArray, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-edit-graded-problem',
  templateUrl: './edit-graded-problem.component.html',
  styleUrls: ['./edit-graded-problem.component.scss']
})
export class EditGradedProblemComponent implements OnInit, OnDestroy {
  @Input() mainFormGroup: FormGroup;
  @Input() gradedProblem: GradedProblemModel;

  controls: {[name: string]: AbstractControl};
  testCases: FormArray;

  constructor() {
  }

  ngOnInit() {
    this.testCases = new FormArray((this.gradedProblem.testCases ? this.gradedProblem.testCases : []).map(testCase => this.createTestCaseGroup(testCase)));

    this.controls = {
      testCaseOutputMode: new FormControl(this.gradedProblem.testCaseOutputMode),
      testCases: this.testCases
    };

    Object.keys(this.controls).forEach(key => this.mainFormGroup.addControl(key, this.controls[key]));
  }

  ngOnDestroy() {
    Object.keys(this.controls).forEach(key => this.mainFormGroup.removeControl(key));
  }

  addTestCase(testCase?: TestCaseModel) {
    this.testCases.push(this.createTestCaseGroup(testCase));
  }

  deleteTestCase(index: number) {
    this.testCases.removeAt(index);
  }

  private createTestCaseGroup(testCase?: TestCaseModel): FormGroup {
    if (!testCase) {
      testCase = {
        input: '',
        output: '',
        hidden: false
      };
    }

    return new FormGroup({
      input: new FormControl(testCase.input),
      output: new FormControl(testCase.output),
      hidden: new FormControl(testCase.hidden)
    });
  }

  get testCaseOutputModes() {
    return Object.keys(TestCaseOutputMode).map(key => TestCaseOutputMode[key]);
  }
}
