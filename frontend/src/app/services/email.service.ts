import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { EmailRequest } from '../../../../common/src/models/email.model';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private endpoint = 'email';

  constructor(private restService: RestService) {}

  send(request: EmailRequest) {
    return this.restService.post<void>(this.endpoint, request);
  }
}
