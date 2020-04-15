import {readFileSync} from 'fs';
import * as mailgun from 'mailgun-js';
import {SendTemplateData, TemplateData} from './templates';

const mg = mailgun(JSON.parse(readFileSync('mailgun.json').toString()));

export function send<T extends TemplateData>(to: string, subject: string, variables: T): Promise<mailgun.messages.SendResponse> {
    const data: SendTemplateData = {
        from: 'CodeLM Team <team@newwavecomputers.com>',
        to,
        subject,
        template: variables.templateName,
        'h:X-Mailgun-Variables': JSON.stringify(variables),
    };

    return mg.messages().send(data);
}
