import { CodeFile } from './codefile';
import { CodegenUtils } from './codegen/utils';

export interface Language {
  name: string;

  compileCmd: (files: string[]) => string[];
  runCmd: (files: string[]) => string[];
  extraFiles?: CodeFile[];

  extension: string;
  fileName: (name: string) => string;
  codeMirrorMode: string;
  documentationUrl: string;
}

export const LANGUAGES: { [language: string]: Language } = Object.freeze({
  java: {
    name: 'java',
    compileCmd: files => ['javac'].concat(files),
    runCmd: files => ['java', files[0].substring(0, files[0].length - 5)],
    extension: 'java',
    fileName: CodegenUtils.toPascalCase,
    codeMirrorMode: 'text/x-java',
    documentationUrl: 'https://docs.oracle.com/en/java/javase/11/docs/api/',
  },
  python: {
    name: 'python',
    compileCmd: files => ['pyflakes'].concat(files),
    runCmd: files => ['python3', files[0]],
    extraFiles: [new CodeFile('__init__.py', '')],
    extension: 'py',
    fileName: CodegenUtils.toSnakeCase,
    codeMirrorMode: 'text/x-python',
    documentationUrl: 'https://docs.python.org/3.8/index.html',
  },
  cpp: {
    name: 'cpp',
    compileCmd: files => ['g++'].concat(files),
    runCmd: () => ['./a.out'],
    extension: 'cpp',
    fileName: CodegenUtils.toPascalCase,
    codeMirrorMode: 'text/x-c++src',
    documentationUrl: 'http://www.cplusplus.com/reference/',
  },
});
