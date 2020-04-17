import * as mailgun from 'mailgun-js';

export type SendTemplateData = mailgun.messages.SendData & {
    template: string;
    'h:X-Mailgun-Variables': string;
}

interface InfoTemplateData {
    templateName: 'info';
    firstName: string;
    username: string;
    password: string;
}

interface InfoTeachersTemplateData {
    templateName: 'info-teachers';
    firstName: string;
}

interface ReminderTemplateData {
    templateName: 'reminder';
    firstName: string;
}

export type TemplateData = InfoTemplateData | InfoTeachersTemplateData | ReminderTemplateData;
