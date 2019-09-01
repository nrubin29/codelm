import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScheduleModel, SettingsModel, SettingsState } from '../../../../../../common/src/models/settings.model';
import { FormArray, FormControl, FormGroup, NgForm } from '@angular/forms';
import * as moment from 'moment';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settings: SettingsModel;

  schedule: FormArray;
  formGroup: FormGroup;

  constructor(private settingsService: SettingsService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.settings = data['settings'];

      this.schedule = new FormArray(this.settings.schedule.map(schedule => this.createScheduleGroup(schedule)));

      this.formGroup = new FormGroup({
        state: new FormControl(this.settings.state),
        preliminaries: new FormControl(this.settings.preliminaries),
        endSurveyLink: new FormControl(this.settings.endSurveyLink),
        schedule: this.schedule,
      });
    });
  }

  submit(form: NgForm) {
    const value = form.value;

    this.settingsService.updateSettings(value).then(() => {
      alert('Updated');
    }).catch(alert);
  }

  reset() {
    this.settingsService.resetSettings().then(() => {
      alert('Reset');
      // TODO: Reload.
    }).catch(alert);
  }

  addSchedule(schedule?: ScheduleModel) {
    this.schedule.push(this.createScheduleGroup(schedule));
  }

  deleteSchedule(index: number) {
    this.schedule.removeAt(index);
  }

  private createScheduleGroup(schedule?: ScheduleModel): FormGroup {
    if (!schedule) {
      schedule = {
        newState: undefined,
        when: new Date()
      };
    }

    return new FormGroup({
      newState: new FormControl(schedule.newState),
      when: new FormControl(moment(schedule.when)),
    });
  }

  get states(): SettingsState[] {
    return Object.keys(SettingsState).map(key => SettingsState[key]);
  }
}
