import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import * as CodeMirror from 'codemirror';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import { EditorConfiguration, EditorFromTextArea } from 'codemirror';

@Component({
  selector: 'app-code-mirror',
  templateUrl: './code-mirror.component.html',
  styleUrls: ['./code-mirror.component.scss']
})
export class CodeMirrorComponent implements AfterViewInit {
  @ViewChild('host', {static: false}) host: ElementRef;
  @Input() config: EditorConfiguration;
  @Output() instance: EditorFromTextArea;
  @Output() change = new EventEmitter<string>();

  private _value = '';

  get value() { return this._value; }

  @Input() set value(v) {
    if (v !== this._value) {
      this._value = v;
    }
  }

  ngAfterViewInit() {
    this.config = this.config || {};
    this.instance = CodeMirror.fromTextArea(this.host.nativeElement, this.config);
    this.instance.setValue(this._value);

    this.instance.on('change', () => {
      const value = this.instance.getValue();
      this.value = value;
      this.change.emit(value);
    });
  }

  writeValue(value: string) {
    this._value = value || '';
    if (this.instance) {
      this.instance.setValue(this._value);
    }
  }
}
