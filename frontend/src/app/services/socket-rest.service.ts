import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { SubmissionModel } from '../../../../common/src/models/submission.model';

@Injectable({
  providedIn: 'root'
})
export class SocketRestService {
  private endpoint = 'sockets';

  constructor(private restService: RestService) { }

  getSockets(): Promise<SubmissionModel> {
    return this.restService.get<any>(this.endpoint);
  }

  kick(id: string): Promise<void> {
    return this.restService.delete<void>(`${this.endpoint}/${id}`);
  }
}
