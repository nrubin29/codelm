import * as mailgun from 'mailgun-js';

export type SendTemplateData = mailgun.messages.SendTemplateData & {
    'h:X-Mailgun-Variables': string;
}

interface InfoTemplateData {
    templateName: 'info';
    firstName: string;
    username: string;
    password: string;
}

export type TemplateData = InfoTemplateData;
