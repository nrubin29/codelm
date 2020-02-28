import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import {SocketList} from "../../../../common/src/models/sockets.model";

@Injectable({
  providedIn: 'root'
})
export class SocketRestService {
  private endpoint = 'sockets';

  constructor(private restService: RestService) { }

  getSockets(): Promise<SocketList> {
    return this.restService.get<SocketList>(this.endpoint);
  }

  kick(id: string): Promise<void> {
    return this.restService.delete<void>(`${this.endpoint}/${id}`);
  }
}
