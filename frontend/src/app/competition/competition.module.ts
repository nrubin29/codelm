import { NgModule } from '@angular/core';
import { CountdownComponent } from './components/countdown/countdown.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { ProblemComponent } from './views/problem/problem.component';
import { StandingsComponent } from './views/standings/standings.component';
import { SubmitComponent } from './views/submit/submit.component';
import { SharedModule } from '../shared.module';
import { CompetitionRoutingModule } from './competition.routing';
import { TeamMatchingComponent } from './views/team-matching/team-matching.component';
import { FileDropComponent } from './components/file-drop/file-drop.component';

@NgModule({
  declarations: [
    CountdownComponent,
    DashboardComponent,
    ProblemComponent,
    StandingsComponent,
    SubmitComponent,
    TeamMatchingComponent,
    FileDropComponent,
  ],
  imports: [SharedModule, CompetitionRoutingModule],
})
export class CompetitionModule {}
