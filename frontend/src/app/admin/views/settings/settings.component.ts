import { Component, OnInit } from '@angular/core';
import { SettingsModel } from '@codelm/common/src/models/settings.model';
import { SettingsService } from '../../../services/settings.service';
import { DialogResult } from '../../../common/components/edit-entity/edit-entity.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  settings: SettingsModel;

  constructor(public settingsService: SettingsService) {}

  ngOnInit() {
    this.settingsService.getSettings().then(settings => {
      this.settings = settings;
    });
  }

  action(result: [DialogResult, SettingsModel]) {
    if (result[0] === 'save') {
      this.settingsService
        .addOrUpdate(result[1])
        .then(() => {
          alert('Updated');
        })
        .catch(alert);
    } else if (result[0] === 'delete') {
      this.settingsService
        .delete()
        .then(() => {
          alert('Reset');
          this.settingsService.getSettings().then(settings => {
            this.settings = settings;
          });
        })
        .catch(alert);
    }
  }
}
