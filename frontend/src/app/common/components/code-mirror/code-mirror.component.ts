import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { EditorView } from '@codemirror/view';
import { EditorState, Extension } from '@codemirror/state';
import { basicSetup } from '@codemirror/basic-setup';
import { java } from '@codemirror/lang-java';
import { Language, LanguageName } from '@codelm/common/src/language';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';

@Component({
  selector: 'app-code-mirror',
  templateUrl: './code-mirror.component.html',
  styleUrls: ['./code-mirror.component.scss'],
})
export class CodeMirrorComponent implements AfterViewInit {
  @Input() language: Language;
  @Input() value: string;
  @Input() readOnly = false;
  @Output() change = new EventEmitter<string>();

  @ViewChild('host') host: ElementRef;
  instance: EditorView;

  ngAfterViewInit() {
    console.log(this.language);

    const languageExtension = ({
      java: java,
      python: python,
      cpp: cpp,
    } as { [language in LanguageName]: () => Extension })[this.language.name];

    this.instance = new EditorView({
      state: EditorState.create({
        doc: this.value,
        extensions: [basicSetup, languageExtension()],
      }),
      parent: this.host.nativeElement,
    });

    /*
    lineWrapping: true,
    readOnly: this.readOnly
     */

    EditorView.updateListener.of(x => {
      if (x.view === this.instance) {
        const value = this.instance.state.doc.toString();
        this.value = value;
        this.change.emit(value);
      }
    });
  }

  writeValue(v: string) {
    this.value = v ?? '';
    if (this.instance) {
      this.instance.update([
        this.instance.state.update({
          changes: {
            from: 0,
            to: this.instance.state.doc.length,
            insert: this.value,
          },
        }),
      ]);
    }
  }
}
