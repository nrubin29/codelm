import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CodeSaverService {
  language: string;

  constructor() {
    this.language = window.localStorage.getItem('language') ?? 'java';
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
    this.language = language;
    window.localStorage.setItem('language', language);
  }

  getMode(language: string) {
    return {
      python: 'text/x-python',
      java: 'text/x-java',
      cpp: 'text/x-c++src',
    }[language];
  }

  getDocumentation() {
    return {
      python: 'https://docs.python.org/3.8/index.html',
      java: 'https://docs.oracle.com/en/java/javase/11/docs/api/',
      cpp: 'http://www.cplusplus.com/reference/',
    }[this.language];
  }
}
