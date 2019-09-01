import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {EditProblemComponent} from '../edit-problem/edit-problem.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {DivisionModel, DivisionType, StarterCode} from '../../../../../../common/src/models/division.model';
import {DivisionService} from '../../../services/division.service';
import {SettingsState} from "../../../../../../common/src/models/settings.model";

@Component({
  selector: 'app-edit-division',
  templateUrl: './edit-division.component.html',
  styleUrls: ['./edit-division.component.scss']
})
export class EditDivisionComponent implements OnInit {
  division: DivisionModel;

  starterCode: FormArray;
  formGroup: FormGroup;

  constructor(private divisionService: DivisionService, private dialogRef: MatDialogRef<EditProblemComponent>, @Inject(MAT_DIALOG_DATA) private data: {division: DivisionModel}) { }

  ngOnInit() {
    this.division = this.data.division ? this.data.division : {_id: undefined, name: undefined, type: undefined, starterCode: []};

    this.starterCode = new FormArray(this.division.starterCode.map(sc => this.createStarterCodeGroup(sc)));

    this.formGroup = new FormGroup({
      _id: new FormControl(this.division._id),
      name: new FormControl(this.division.name),
      type: new FormControl(this.division.type),
      starterCode: this.starterCode
    });
  }

  handleFile(files: FileList, i: number) {
    this.starterCode.at(i).get('file').setValue(files[0]);
  }

  get formValue() {
    return this.formGroup.getRawValue();
  }

  private createStarterCodeGroup(starterCode?: StarterCode): FormGroup {
    if (!starterCode) {
      starterCode = {
        state: undefined,
        file: undefined
      };
    }

    return new FormGroup({
      state: new FormControl(starterCode.state ? starterCode.state : ''),
      file: new FormControl(starterCode.file ? 'file' : undefined),
    });
  }

  addStarterCode(starterCode?: StarterCode) {
    this.starterCode.push(this.createStarterCodeGroup(starterCode));
  }

  deleteStarterCode(index: number) {
    this.starterCode.removeAt(index);
  }

  get types(): DivisionType[] {
    return Object.keys(DivisionType).map(key => DivisionType[key]);
  }

  get states(): SettingsState[] {
    return Object.keys(SettingsState).map(key => SettingsState[key]);
  }
}
