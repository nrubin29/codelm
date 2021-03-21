import { Component, Input, OnInit } from '@angular/core';
import { TeamModel } from '@codelm/common/src/models/team.model';
import { TeamService } from '../../../services/team.service';
import { Router } from '@angular/router';
import { DialogResult } from '../../../common/components/edit-entity/edit-entity.component';
import { TeamUtil } from '@codelm/common/src/utils/team.util';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../../common/components/dialog/dialog.component';

@Component({
  selector: 'app-edit-team',
  templateUrl: './edit-team.component.html',
  styleUrls: ['./edit-team.component.scss'],
})
export class EditTeamComponent implements OnInit {
  @Input() team: TeamModel;

  constructor(
    public teamService: TeamService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {}

  get teamName() {
    return this.team ? TeamUtil.getName(this.team) : null;
  }

  action(result: [DialogResult, TeamModel]) {
    if (result[0] === 'save') {
      this.teamService
        .addOrUpdate(result[1])
        .then(() => {
          DialogComponent.showSuccess(this.dialog, 'Successfully added team!');
        })
        .catch(alert);
    } else if (result[0] === 'delete') {
      this.teamService
        .delete(this.team)
        .then(() => {
          this.router.navigate(['/admin']);
        })
        .catch(alert);
    }
  }
}
