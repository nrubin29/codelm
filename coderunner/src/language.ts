import {CodeFile} from "./codefile";

export interface Language {
  compile: (files: string[]) => string[];
  run: (files: string[]) => string[];
  extension: string;
  files?: CodeFile[];
}

export const languages: {[language: string]: Language} = Object.freeze({
  java: {
    compile: files => ['javac'].concat(files),
    run: files => ['java', files[0].substring(0, files[0].length - 5)],
    extension: 'java'
  },
  python: {
    compile: files => ['python', '-m', 'py_compile'].concat(files),
    run: files => ['python3', files[0]],
    extension: 'py',
    files: [new CodeFile('__init__.py', '')]
  },
  cpp: {
    compile: files => ['g++'].concat(files),
    run: () => ['./a.out'],
    extension: 'cpp'
  }
});
