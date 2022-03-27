import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-file-drop',
  templateUrl: './file-drop.component.html',
  styleUrls: ['./file-drop.component.scss'],
})
export class FileDropComponent {
  @Input() accept: string;
  @Output() fileDropped = new EventEmitter<string>();
  file: File;

  @ViewChild('input') input: ElementRef<HTMLInputElement>;
  @HostBinding('style.background-color') private background = '#ffffff';

  @HostListener('click', ['$event']) onClick() {
    this.input.nativeElement.click();
  }

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
      this.handleFile(file);
    }
  }

  onFilePicked(files: FileList) {
    if (files.length > 0) {
      this.handleFile(files.item(0));
    }
  }

  handleFile(file: File) {
    const extension = file.name.split('.').pop();

    if (extension !== this.accept) {
      this.background = '#ff0000';
    } else {
      this.file = file;
      this.background = '#00ff00';

      const fileReader = new FileReader();

      fileReader.addEventListener('load', event => {
        this.fileDropped.emit(event.target.result as string);
      });

      fileReader.readAsText(this.file);
    }
  }
}
