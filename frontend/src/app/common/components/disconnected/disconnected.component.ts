import { Component } from '@angular/core';

@Component({
  selector: 'app-disconnected',
  templateUrl: './disconnected.component.html',
  styleUrls: ['./disconnected.component.scss'],
})
export class DisconnectedComponent {
  logIn() {
    location.href = '/';
  }
}
