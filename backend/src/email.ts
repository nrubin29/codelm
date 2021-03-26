import { env } from './env';
import * as mailgun from 'mailgun-js';
import { PersonModel } from '../../common/src/models/person.model';
import {
  EmailTemplate,
  emailTemplateToSubject,
} from '../../common/src/models/email.model';

interface MailgunVariables {
  firstName: string;
}

const mg = mailgun(env.mailgun);

export function sendEmail(to: PersonModel[], template: EmailTemplate) {
  return Promise.all(
    to.map(person =>
      mg.messages().send({
        from: 'CodeLM Team <team@newwavecomputers.com>',
        to: person.email,
        subject: emailTemplateToSubject[template],
        template: template,
        'h:X-Mailgun-Variables': JSON.stringify({
          firstName: person.name.split(' ')[0],
        } as MailgunVariables),
      })
    )
  );
}
