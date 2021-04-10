import { Injectable } from '@angular/core';
import { Language, LanguageName, LANGUAGES } from '@codelm/common/src/language';

type CodeEntryMode = 'editor' | 'file';

@Injectable({
  providedIn: 'root',
})
export class CodeSaverService {
  language: Language;
  codeEntryMode: CodeEntryMode;

  constructor() {
    this.language =
      LANGUAGES[
        (window.localStorage.getItem('language') as LanguageName) ?? 'java'
      ];
    this.codeEntryMode =
      (window.localStorage.getItem('codeEntryMode') as CodeEntryMode) ??
      'editor';
  }

  save(problemId: string, languageName: LanguageName, code: string) {
    const problem = JSON.parse(window.localStorage.getItem(problemId) ?? '{}');
    problem[languageName] = code;
    window.localStorage.setItem(problemId, JSON.stringify(problem));
  }

  get(problemId: string, languageName: LanguageName): string | null {
    const problem = JSON.parse(window.localStorage.getItem(problemId) ?? '{}');
    return problem[languageName] || null;
  }

  getLanguage() {
    return this.language;
  }

  setLanguage(language: LanguageName) {
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
