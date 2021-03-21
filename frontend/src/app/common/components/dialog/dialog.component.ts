import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

interface DialogOptions {
  title?: string;
  body: string;
  confirm?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public options: DialogOptions) {}

  static show(
    dialog: MatDialog,
    body: string,
    options?: Omit<DialogOptions, 'body'>
  ) {
    return dialog
      .open<DialogComponent, DialogOptions, boolean>(DialogComponent, {
        data: { ...options, body } as DialogOptions,
      })
      .afterClosed()
      .toPromise();
  }

  static showSuccess(dialog: MatDialog, body: string, title?: string) {
    return DialogComponent.show(dialog, body, { title, icon: 'success' });
  }

  static showError(dialog: MatDialog, error: any) {
    if (error instanceof Error) {
      return DialogComponent.show(dialog, error.message, {
        title: error.name,
        icon: 'error',
      });
    }

    return DialogComponent.show(dialog, error, {
      title: 'Error',
      icon: 'error',
    });
  }

  static confirm(dialog: MatDialog, body: string) {
    return DialogComponent.show(dialog, body, {
      title: 'Confirm',
      confirm: true,
      icon: 'help',
    });
  }
}
