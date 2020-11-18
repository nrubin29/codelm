import { Request, Response, Router } from 'express';
import { AuthUtil } from '../auth.util';
import { EmailRequest } from '@codelm/common/src/models/email.model';
import { PersonDao } from '../daos/person.dao';
import { env } from '../env';
import * as mailgun from 'mailgun-js';

interface MailgunVariables {
  firstName: string;
}

const router = Router();

const mg = mailgun(env.mailgun);

router.post(
  '/',
  AuthUtil.requireSuperUser,
  async (req: Request, res: Response) => {
    const emailRequest = req.body as EmailRequest;

    // TODO: Handle attachments from req.files.
    // if (attachment) {
    //   const buffer = new Buffer(attachment.data as string);
    //   attach = new mg.Attachment(
    //     Object.assign({}, attachment, {
    //       data: buffer,
    //       knownLength: buffer.length,
    //     })
    //   );
    // }

    const persons = await PersonDao.getPeopleByIds(emailRequest.to);

    for (const person of persons) {
      await mg.messages().send({
        from: 'CodeLM Team <team@newwavecomputers.com>',
        to: person.email,
        subject: emailRequest.subject,
        template: emailRequest.template,
        'h:X-Mailgun-Variables': JSON.stringify({
          firstName: person.name.split(' ')[0],
        } as MailgunVariables),
      });
    }

    res.sendStatus(200);
  }
);

export default router;
