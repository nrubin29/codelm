import {Component, EventEmitter, HostBinding, HostListener, Input, Output} from '@angular/core';

@Component({
  selector: 'app-file-drop',
  templateUrl: './file-drop.component.html',
  styleUrls: ['./file-drop.component.scss']
})
export class FileDropComponent {
  @Input() accept: string;
  @Output() fileDropped = new EventEmitter<File>();

  // @ViewChild('input') input: ElementRef;
  @HostBinding('style.background-color') private background = '#ffffff';

  // @HostListener('click', ['$event']) onClick(event: Event) {
  //   console.log(this.input);
  //   console.log(this.input.nativeElement);
  //   console.log(this.input.nativeElement.click);
  //   event.preventDefault();
  //   event.stopPropagation();
  //   this.input.nativeElement.click();
  // }

  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.background = '#e2eefd';
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.background = '#ffffff';
  }

  @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.background = '#ffffff';

    if (event.dataTransfer?.files?.length > 0) {
      const file = event.dataTransfer.files.item(0);

      if (file.type !== this.accept) {
        this.background = '#ff0000';
      }

      else {
        this.fileDropped.emit(file);
      }
    }
  }

  // onManual(files: FileList) {
  //   if (files.length > 0) {
  //     this.fileDropped.emit(files.item(0));
  //   }
  // }

}
