import { Component, Input, OnInit } from '@angular/core';
import { TeamModel } from '../../../../../../common/src/models/team.model';
import { TeamService } from '../../../services/team.service';
import { Router } from '@angular/router';
import {SettingsModel} from "../../../../../../common/src/models/settings.model";
import {DialogResult} from "../edit-entity/edit-entity.component";

@Component({
  selector: 'app-edit-team',
  templateUrl: './edit-team.component.html',
  styleUrls: ['./edit-team.component.scss']
})
export class EditTeamComponent implements OnInit {
  @Input() team: TeamModel;

  constructor(public teamService: TeamService, private router: Router) {
  }

  ngOnInit() {
  }

  action(result: [DialogResult, SettingsModel]) {
    if (result[0] === 'save') {
      this.teamService.addOrUpdate(result[1]).then(() => {
        alert('Added team');
      }).catch(alert);
    }

    else if (result[0] === 'delete') {
      this.teamService.delete(this.team).then(() => {
        this.router.navigate(['/admin']);
      }).catch(alert);
    }
  }
}
