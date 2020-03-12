import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './views/settings/settings.component';
import { TeamComponent } from './views/team/team.component';
import { TeamResolve } from '../resolves/team.resolve';
import { SubmissionsResolve } from '../resolves/submissions.resolve';
import { SubmissionComponent } from '../common/views/submission/submission.component';
import { SubmissionResolve } from '../resolves/submission.resolve';
import { EditTeamComponent } from './components/edit-team/edit-team.component';
import { SocketGuard } from '../guards/socket.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminComponent } from './views/admin/admin.component';
import { NgModule } from '@angular/core';
import { SuperUserGuard } from '../guards/super-user.guard';
import {HighlowComponent} from "../common/views/highlow/highlow.component";
import {TimesweeperComponent} from "../common/views/timesweeper/timesweeper.component";
import {EntityGroupingComponent} from "./views/entity-grouping/entity-grouping.component";
import {EntityServiceResolve} from "../resolves/entity-service.resolve";
import {EntityListComponent} from "./views/entity-list/entity-list.component";

const routes: Routes = [
  {
    path: '', component: AdminComponent, canActivate: [SocketGuard, AdminGuard], children:
      [
        {path: '', redirectTo: 'standings', pathMatch: 'full'},
        {path: 'standings', component: EntityGroupingComponent, resolve: {entityService: EntityServiceResolve}},
        {path: 'settings', component: SettingsComponent, canActivate: [SuperUserGuard]},
        {path: 'sockets', component: EntityGroupingComponent, resolve: {entityService: EntityServiceResolve}},
        {path: 'team/:id', component: TeamComponent, resolve: {team: TeamResolve, submissions: SubmissionsResolve}},
        {path: 'submission/:id', component: SubmissionComponent, resolve: {submission: SubmissionResolve}},
        {path: 'disputes', component: EntityListComponent, resolve: {entityService: EntityServiceResolve}},
        {path: 'divisions', component: EntityListComponent, canActivate: [SuperUserGuard], resolve: {entityService: EntityServiceResolve}},
        {path: 'problems', component: EntityGroupingComponent, canActivate: [SuperUserGuard], resolve: {entityService: EntityServiceResolve}},
        {path: 'admins', component: EntityListComponent, canActivate: [SuperUserGuard], resolve: {entityService: EntityServiceResolve}},
        {path: 'add-team', component: EditTeamComponent},
        {path: 'game', children: [
            {path: 'highlow', component: HighlowComponent},
            {path: 'timesweeper', component: TimesweeperComponent}
          ]}
      ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
