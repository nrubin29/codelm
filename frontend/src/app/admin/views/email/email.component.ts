import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PersonModel } from '@codelm/common/src/models/person.model';
import { GroupModel } from '@codelm/common/src/models/group.model';
import { EmailService } from '../../../services/email.service';
import {
  EmailTemplate,
  emailTemplates,
} from '@codelm/common/src/models/email.model';
import { DialogComponent } from '../../../common/components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
})
export class EmailComponent implements OnInit {
  persons: PersonModel[];
  groups: GroupModel[];

  template: EmailTemplate;
  to: PersonModel[];

  constructor(
    private emailService: EmailService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  get templates() {
    return emailTemplates;
  }

  ngOnInit() {
    this.persons = this.activatedRoute.snapshot.data.persons;
    this.groups = this.activatedRoute.snapshot.data.groups;
  }

  async send() {
    await this.emailService.send({
      template: this.template,
      to: this.to.map(person => person._id),
    });

    await DialogComponent.showSuccess(this.dialog, 'Email sent!');
  }
}
