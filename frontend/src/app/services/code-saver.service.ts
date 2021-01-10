import { Injectable } from '@angular/core';
import { Language, LANGUAGES } from '@codelm/common/src/language';

@Injectable({
  providedIn: 'root',
})
export class CodeSaverService {
  language: Language;

  constructor() {
    this.language =
      LANGUAGES[window.localStorage.getItem('language') ?? 'java'];
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
}
