import { YEAR } from '../../version';

export type EmailTemplate =
  | 'registered'
  | 'info'
  | 'info-teachers'
  | 'reminder'
  | 'wrapup';

export const emailTemplates = [
  'registered',
  'info',
  'info-teachers',
  'reminder',
  'wrapup',
] as EmailTemplate[];

export const emailTemplateToSubject = Object.freeze({
  registered: `[Please read] Next Steps for CodeLM ${YEAR}`,
  info: `[Please read] Important information for CodeLM ${YEAR}`,
  'info-teachers': `[Please read] Important information for CodeLM ${YEAR}`,
  reminder: `[Reminder] CodeLM ${YEAR} is Tomorrow!`,
  wrapup: `CodeLM ${YEAR} Wrap-up`,
} as {
  [template in EmailTemplate]: string;
});

export interface EmailRequest {
  template: EmailTemplate;
  /** A list of ObjectIds of Persons to send the email to. */
  to: string[];
}
