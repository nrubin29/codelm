import * as Router from 'koa-router';
import * as koaBody from 'koa-body';
import { PermissionsUtil } from '../permissions.util';
import { EmailRequest } from '@codelm/common/src/models/email.model';
import { PersonDao } from '../daos/person.dao';
import { env } from '../env';
import * as mailgun from 'mailgun-js';

interface MailgunVariables {
  firstName: string;
}

const router = new Router();
router.use(PermissionsUtil.requireSuperUser);
router.use(koaBody());

const mg = mailgun(env.mailgun);

router.post('/', async ctx => {
  const emailRequest = ctx.request.body as EmailRequest;

  // TODO: Handle attachments from ctx.request.files.
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

  ctx.status = 200;
});

export default router;
