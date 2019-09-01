import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { TeamModel } from '../../../../../../common/src/models/team.model';
import { TeamService } from '../../../services/team.service';
import { DivisionModel } from '../../../../../../common/src/models/division.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-team',
  templateUrl: './edit-team.component.html',
  styleUrls: ['./edit-team.component.scss']
})
export class EditTeamComponent implements OnInit {
  @Input() team: TeamModel;
  divisions: DivisionModel[];

  formGroup: FormGroup;
  originalPassword: string;

  constructor(private teamService: TeamService, private activatedRoute: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.divisions = data['divisions'];

      this.team = this.team ? this.team : {
        _id: undefined,
        username: undefined,
        password: undefined,
        salt: undefined,
        members: undefined,
        division: undefined
      };
      this.originalPassword = this.team.password;

      this.formGroup = new FormGroup({
        _id: new FormControl(this.team._id),
        username: new FormControl(this.team.username),
        password: new FormControl('', Validators.required),
        members: new FormControl(this.team.members),
        division: new FormControl(this.team.division)
      });
    });
  }

  submit(form: NgForm) {
    const team = form.value;

    if (this.originalPassword === team.password) {
      delete team.password;
    }

    this.teamService.addOrUpdateTeam(form.value).then(() => {
      // this.adminsComponent.reload();

      // TODO: If this is on the team page, reload the page. Otherwise, reload this page so another team can be entered.
      this.router.navigate(['/admin']);
    }).catch(alert);
  }

  delete() {
    if (confirm('Are you sure you want to delete this admin?')) {
      this.teamService.deleteTeam(this.team._id).then(() => {
        // this.adminsComponent.reload();
        this.router.navigate(['/admin']);
      }).catch(alert);
    }
  }
}
