import { NgModule } from '@angular/core';
import { EditAdminComponent } from './components/edit-admin/edit-admin.component';
import { EditDivisionComponent } from './components/edit-division/edit-division.component';
import { EditProblemComponent } from './components/edit-problem/edit-problem.component';
import { EditTeamComponent } from './components/edit-team/edit-team.component';
import { AdminComponent } from './views/admin/admin.component';
import { SettingsComponent } from './views/settings/settings.component';
import { TeamComponent } from './views/team/team.component';
import { SharedModule } from '../shared.module';
import { EditGradedProblemComponent } from './components/edit-graded-problem/edit-graded-problem.component';
import { AdminRoutingModule } from './admin.routing';
import { EditOpenEndedProblemComponent } from './components/edit-open-ended-problem/edit-open-ended-problem.component';
import {AngularEditorModule} from "@kolkov/angular-editor";
import { ViewSubmissionsComponent } from './components/view-submissions/view-submissions.component';
import { SocketsComponent } from './views/sockets/sockets.component';
import { EntityGroupingComponent } from './views/entity-grouping/entity-grouping.component';
import { EntityListComponent } from './views/entity-list/entity-list.component';
import { LeaderboardCellComponent } from './components/leaderboard-cell/leaderboard-cell.component';

@NgModule({
  declarations: [
    EditAdminComponent,
    EditDivisionComponent,
    EditProblemComponent,
    EditTeamComponent,
    AdminComponent,
    SettingsComponent,
    TeamComponent,
    EditGradedProblemComponent,
    EditOpenEndedProblemComponent,
    ViewSubmissionsComponent,
    SocketsComponent,
    EntityGroupingComponent,
    EntityListComponent,
    LeaderboardCellComponent,
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
