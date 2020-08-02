import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PersonModel } from '../../../../../../common/src/models/person.model';
import { GroupModel } from '../../../../../../common/src/models/group.model';
import { EmailService } from '../../../services/email.service';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
})
export class EmailComponent implements OnInit {
  persons: PersonModel[];
  groups: GroupModel[];
  readonly templates = ['info', 'info-teachers', 'reminder', 'wrapup'];

  template: string;
  to: PersonModel[];
  subject: string;

  constructor(
    private emailService: EmailService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.persons = this.activatedRoute.snapshot.data.persons;
    this.groups = this.activatedRoute.snapshot.data.groups;
  }

  send() {
    this.emailService.send({
      template: this.template,
      to: this.to.map(person => person._id),
      subject: this.subject,
    });
  }
}
