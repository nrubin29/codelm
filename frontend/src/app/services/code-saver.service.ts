import { Injectable } from '@angular/core';
import { Language, LANGUAGES } from '@codelm/common/src/language';

type CodeEntryMode = 'editor' | 'file';

@Injectable({
  providedIn: 'root',
})
export class CodeSaverService {
  language: Language;
  codeEntryMode: CodeEntryMode;

  constructor() {
    this.language =
      LANGUAGES[window.localStorage.getItem('language') ?? 'java'];
    this.codeEntryMode =
      (window.localStorage.getItem('codeEntryMode') as CodeEntryMode) ??
      'editor';
  }

  save(problemId: string, mode: string, code: string) {
    const problem = JSON.parse(window.localStorage.getItem(problemId) || '{}');
    problem[mode] = code;
    window.localStorage.setItem(problemId, JSON.stringify(problem));
  }

  get(problemId: string, mode: string): string | null {
    const problem = JSON.parse(window.localStorage.getItem(problemId) || '{}');
    return problem[mode] || null;
  }

  getLanguage() {
    return this.language;
  }

  setLanguage(language: string) {
    this.language = LANGUAGES[language];
    window.localStorage.setItem('language', language);
  }

  getCodeEntryMode() {
    return this.codeEntryMode;
  }

  setCodeEntryMode(mode: CodeEntryMode) {
    this.codeEntryMode = mode;
    window.localStorage.setItem('codeEntryMode', mode);
  }
}
