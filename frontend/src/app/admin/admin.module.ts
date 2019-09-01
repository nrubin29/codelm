import { NgModule } from '@angular/core';
import { EditAdminComponent } from './components/edit-admin/edit-admin.component';
import { EditDivisionComponent } from './components/edit-division/edit-division.component';
import { EditProblemComponent } from './components/edit-problem/edit-problem.component';
import { EditTeamComponent } from './components/edit-team/edit-team.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { AdminComponent } from './views/admin/admin.component';
import { AdminHomeComponent } from './views/admin-home/admin-home.component';
import { AdminsComponent } from './views/admins/admins.component';
import { DisputesComponent } from './views/disputes/disputes.component';
import { DivisionsComponent } from './views/divisions/divisions.component';
import { ProblemsComponent } from './views/problems/problems.component';
import { SettingsComponent } from './views/settings/settings.component';
import { TeamComponent } from './views/team/team.component';
import { SharedModule } from '../shared.module';
import { EditGradedProblemComponent } from './components/edit-graded-problem/edit-graded-problem.component';
import { AdminRoutingModule } from './admin.routing';
import { EditOpenEndedProblemComponent } from './components/edit-open-ended-problem/edit-open-ended-problem.component';
import {AngularEditorModule} from "@kolkov/angular-editor";
import { ViewSubmissionsComponent } from './components/view-submissions/view-submissions.component';
import { SocketsComponent } from './views/sockets/sockets.component';

@NgModule({
  declarations: [
    EditAdminComponent,
    EditDivisionComponent,
    EditProblemComponent,
    EditTeamComponent,
    LeaderboardComponent,
    AdminComponent,
    AdminHomeComponent,
    AdminsComponent,
    DisputesComponent,
    DivisionsComponent,
    ProblemsComponent,
    SettingsComponent,
    TeamComponent,
    EditGradedProblemComponent,
    EditOpenEndedProblemComponent,
    ViewSubmissionsComponent,
    SocketsComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule,
    AngularEditorModule
  ],
  entryComponents: [
    EditProblemComponent,
    EditDivisionComponent,
    EditAdminComponent,
    ViewSubmissionsComponent
  ],
})
export class AdminModule { }
