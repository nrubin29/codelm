import { IsNotEndGuard } from '../guards/is-not-end.guard';
import { SocketGuard } from '../guards/socket.guard';
import { TeamGuard } from '../guards/team.guard';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { StandingsComponent } from './views/standings/standings.component';
import { ProblemComponent } from './views/problem/problem.component';
import { ProblemGuard } from '../guards/problem.guard';
import { ProblemResolve } from '../resolves/problem.resolve';
import { SubmissionsResolve } from '../resolves/submissions.resolve';
import { SubmitComponent } from './views/submit/submit.component';
import { SubmissionComponent } from '../common/views/submission/submission.component';
import { SubmissionResolve } from '../resolves/submission.resolve';
import { NgModule } from '@angular/core';
import { SubmittingGuard } from '../guards/submitting.guard';
import {GameComponent} from '../common/views/game/game.component';

const routes: Routes = [
  {
    path: '', component: DashboardComponent, canActivate: [SocketGuard, TeamGuard, IsNotEndGuard], children:
      [
        {path: '', component: StandingsComponent},
        {path: 'problem/:id', component: ProblemComponent, canActivate: [ProblemGuard], resolve: {problem: ProblemResolve, submissions: SubmissionsResolve}},
        {path: 'submit', component: SubmitComponent, canActivate: [SubmittingGuard], canDeactivate: [SubmittingGuard]},
        {path: 'submission/:id', component: SubmissionComponent, resolve: {submission: SubmissionResolve}},
        {path: 'game/:gameType', component: GameComponent},
      ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [RouterModule]
})
export class CompetitionRoutingModule {}
