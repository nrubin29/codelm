import { CodeFile } from './codefile';
import { CodegenUtils } from '@codelm/common/src/codegen/utils';

export interface Language {
  compile: (files: string[]) => string[];
  run: (files: string[]) => string[];
  extension: string;
  fileName: (name: string) => string;
  files?: CodeFile[];
}

export const languages: { [language: string]: Language } = Object.freeze({
  java: {
    compile: files => ['javac'].concat(files),
    run: files => ['java', files[0].substring(0, files[0].length - 5)],
    extension: 'java',
    fileName: CodegenUtils.toPascalCase,
  },
  python: {
    compile: files => ['pyflakes'].concat(files),
    run: files => ['python3', files[0]],
    extension: 'py',
    fileName: CodegenUtils.toSnakeCase,
    files: [new CodeFile('__init__.py', '')],
  },
  cpp: {
    compile: files => ['g++'].concat(files),
    run: () => ['./a.out'],
    extension: 'cpp',
    fileName: CodegenUtils.toPascalCase,
  },
});
