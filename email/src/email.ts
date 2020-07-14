import { readFileSync } from 'fs';
import * as mailgun from 'mailgun-js';
import { SendTemplateData, TemplateData } from './templates';

const mg = mailgun(JSON.parse(readFileSync('mailgun.json').toString()));

export function send(
  to: string,
  subject: string,
  variables: TemplateData,
  attachment?: mailgun.AttachmentParams
): Promise<mailgun.messages.SendResponse> {
  let attach = undefined;

  if (attachment) {
    const buffer = new Buffer(attachment.data as string);
    attach = new mg.Attachment(
      Object.assign({}, attachment, {
        data: buffer,
        knownLength: buffer.length,
      })
    );
  }

  const data: SendTemplateData = {
    from: 'CodeLM Team <team@newwavecomputers.com>',
    to,
    subject,
    template: variables.templateName,
    'h:X-Mailgun-Variables': JSON.stringify(variables),
    attachment: attach,
  };

  return mg.messages().send(data);
}
