import { Component, OnInit } from '@angular/core';
import {SocketRestService} from "../../../services/socket-rest.service";

@Component({
  selector: 'app-sockets',
  templateUrl: './sockets.component.html',
  styleUrls: ['./sockets.component.scss']
})
export class SocketsComponent implements OnInit {
  sockets: any;

  constructor(private socketRestService: SocketRestService) { }

  ngOnInit() {
    this.socketRestService.getSockets().then(res => {
      this.sockets = res;
    });

    setInterval(() => {
      this.socketRestService.getSockets().then(res => {
        console.log(res);
        this.sockets = res;
      });
    }, 30 * 1000);
  }

  kick(id: string) {
    this.socketRestService.kick(id).then(() => alert('Kicked'));
  }
}
