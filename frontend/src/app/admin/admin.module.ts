import { NgModule } from '@angular/core';
import { EditTeamComponent } from './components/edit-team/edit-team.component';
import { AdminComponent } from './views/admin/admin.component';
import { SettingsComponent } from './views/settings/settings.component';
import { TeamComponent } from './views/team/team.component';
import { SharedModule } from '../shared.module';
import { AdminRoutingModule } from './admin.routing';
import {AngularEditorModule} from "@kolkov/angular-editor";
import { ViewSubmissionsComponent } from './components/view-submissions/view-submissions.component';
import { EntityGroupingComponent } from './views/entity-grouping/entity-grouping.component';
import { EntityListComponent } from './views/entity-list/entity-list.component';
import { LeaderboardCellComponent } from './components/leaderboard-cell/leaderboard-cell.component';
import { EditEntityComponent } from './components/edit-entity/edit-entity.component';
import { DynamicFormFieldComponent } from './components/dynamic-form-field/dynamic-form-field.component';

@NgModule({
  declarations: [
    EditTeamComponent,
    AdminComponent,
    SettingsComponent,
    TeamComponent,
    ViewSubmissionsComponent,
    EntityGroupingComponent,
    EntityListComponent,
    LeaderboardCellComponent,
    EditEntityComponent,
    DynamicFormFieldComponent,
  ],
  imports: [
    SharedModule,
    AdminRoutingModule,
    AngularEditorModule
  ],
})
export class AdminModule { }
