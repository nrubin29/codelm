import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SocketPacketManager } from '@codelm/common/src/packet.manager';
import { skipWhile } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DisconnectedComponent } from '../common/components/disconnected/disconnected.component';

@Injectable({
  providedIn: 'root',
})
export class SocketService extends SocketPacketManager<WebSocket> {
  private listening = false;
  private dialogRef: MatDialogRef<DisconnectedComponent> | null;

  constructor(private matDialog: MatDialog) {
    super(
      () =>
        new WebSocket(
          environment.wsProtocol +
          '://' +
          location.hostname +
          environment.socketSuffix
        )
    );
  }

  /**
   * This is necessary because we don't want to handle disconnects until the
   * user logs in successfully.
   */
  listenOnDisconnect() {
    this.listening = true;
  }

  connect(): Promise<void> {
    return super.connect().then(() => {
      this.dialogRef?.close();
      this.dialogRef = null;
      this.onDisconnect()
        .pipe(skipWhile(() => !this.listening))
        .subscribe(() => {
          this.dialogRef = this.matDialog.open(DisconnectedComponent, { disableClose: true });
        });
    });
  }
}
