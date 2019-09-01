import { Component, Inject, OnInit } from '@angular/core';
import { ProblemDivision, ProblemModel, ProblemType } from '../../../../../../common/src/models/problem.model';
import { DivisionModel } from '../../../../../../common/src/models/division.model';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ProblemService } from '../../../services/problem.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-edit-problem',
  templateUrl: './edit-problem.component.html',
  styleUrls: ['./edit-problem.component.scss']
})
export class EditProblemComponent implements OnInit {
  problem: ProblemModel;
  divisionModels: DivisionModel[];

  divisions: FormArray;
  formGroup: FormGroup;

  constructor(private problemService: ProblemService, private dialogRef: MatDialogRef<EditProblemComponent>, @Inject(MAT_DIALOG_DATA) private data: {problem: ProblemModel, divisions: DivisionModel[]}) { }

  ngOnInit() {
    this.divisionModels = this.data.divisions;
    this.problem = this.data.problem ? this.data.problem : {
      _id: undefined,
      title: undefined,
      description: undefined,
      type: undefined,
      divisions: []
    };

    this.divisions = new FormArray(this.problem.divisions.map(problemDivision => this.createProblemDivisionGroup(problemDivision)));

    this.formGroup = new FormGroup({
      _id: new FormControl(this.problem._id),
      title: new FormControl(this.problem.title),
      description: new FormControl(this.problem.description),
      type: new FormControl(this.problem.type),
      divisions: this.divisions
    });
  }

  get isGradedProblem() {
    return this.formGroup.get('type').value === ProblemType.Graded.toString();
  }

  get isUploadProblem() {
    return this.formGroup.get('type').value === ProblemType.OpenEnded.toString();
  }

  get formValue() {
    return this.formGroup.getRawValue();
  }

  private createProblemDivisionGroup(problemDivision?: ProblemDivision): FormGroup {
    if (!problemDivision) {
      problemDivision = {
        division: undefined,
        problemNumber: undefined,
        points: undefined
      };
    }

    return new FormGroup({
      division: new FormControl(problemDivision.division ? problemDivision.division._id : ''),
      problemNumber: new FormControl(problemDivision.problemNumber),
      points: new FormControl(problemDivision.points),
    });
  }

  addDivision(problemDivision?: ProblemDivision) {
    this.divisions.push(this.createProblemDivisionGroup(problemDivision));
  }

  deleteDivision(index: number) {
    this.divisions.removeAt(index);
  }

  get problemTypes() {
    return Object.keys(ProblemType).map(key => ProblemType[key]);
  }
}
