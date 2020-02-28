import { Component, OnInit } from '@angular/core';
import {SocketRestService} from "../../../services/socket-rest.service";
import {SocketList} from "../../../../../../common/src/models/sockets.model";

@Component({
  selector: 'app-sockets',
  templateUrl: './sockets.component.html',
  styleUrls: ['./sockets.component.scss']
})
export class SocketsComponent implements OnInit {
  sockets: SocketList;

  constructor(private socketRestService: SocketRestService) { }

  ngOnInit() {
    this.socketRestService.getSockets().then(res => {
      this.sockets = res;
    });

    // setInterval(() => {
    //   this.socketRestService.getSockets().then(res => {
    //     console.log(res);
    //     this.sockets = res;
    //   });
    // }, 30 * 1000);
  }

  kick(id: string) {
    this.socketRestService.kick(id).then(() => alert('Kicked'));
  }
}
