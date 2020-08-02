export interface EmailRequest {
  template: string;
  /** A list of ObjectIds of Persons to send the email to. */
  to: string[];
  subject: string;
}
