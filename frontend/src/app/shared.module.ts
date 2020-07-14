import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SubmissionComponent } from './common/views/submission/submission.component';
import { PluralizePipe } from './pipes/pluralize.pipe';
import { CardComponent } from './common/components/card/card.component';
import { CodeMirrorComponent } from './common/components/code-mirror/code-mirror.component';
import { GradedSubmissionComponent } from './common/views/graded-submission/graded-submission.component';
import { UploadSubmissionComponent } from './common/views/upload-submission/upload-submission.component';
import { HighlowComponent } from './common/components/highlow/highlow.component';
import { TimesweeperComponent } from './common/components/timesweeper/timesweeper.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AllCodeComponent } from './common/components/all-code/all-code.component';
import { TitlePipe } from './pipes/title.pipe';
import { FaqComponent } from './common/components/faq/faq.component';
import { GameComponent } from './common/views/game/game.component';
import { FileDropComponent } from './common/components/file-drop/file-drop.component';
import { PluralizeSentencePipe } from './pipes/pluralize-sentence.pipe';
import { AlertComponent } from './common/components/alert/alert.component';

@NgModule({
  declarations: [
    SubmissionComponent,
    GradedSubmissionComponent,
    UploadSubmissionComponent,
    HighlowComponent,
    TimesweeperComponent,
    CardComponent,
    CodeMirrorComponent,
    AllCodeComponent,
    FaqComponent,
    GameComponent,
    FileDropComponent,
    AlertComponent,
    PluralizePipe,
    PluralizeSentencePipe,
    TitlePipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    MatCardModule,
    MatSidenavModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatSelectModule,
    MatToolbarModule,
    MatButtonModule,
    MatListModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatIconModule,
    MatDialogModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatMenuModule,
    MatRadioModule,
    MatTooltipModule,
  ],
  exports: [
    SubmissionComponent,
    GradedSubmissionComponent,
    UploadSubmissionComponent,
    CardComponent,
    CodeMirrorComponent,
    FileDropComponent,
    AlertComponent,
    PluralizePipe,
    PluralizeSentencePipe,
    TitlePipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    MatCardModule,
    MatSidenavModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatSelectModule,
    MatToolbarModule,
    MatButtonModule,
    MatListModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatIconModule,
    MatDialogModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatMenuModule,
    MatRadioModule,
    MatTooltipModule,
  ],
})
export class SharedModule {}
