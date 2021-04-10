import { CodeFile } from './codefile';
import { CodegenUtils } from './codegen/utils';
import { CodeGenerator } from './codegen/codegen';
import { JavaCodeGenerator } from './codegen/java.codegen';
import { PythonCodeGenerator } from './codegen/python.codegen';
import { CppCodeGenerator } from './codegen/cpp.codegen';
import { GradedProblemModel } from './models/problem.model';

export type LanguageName = 'java' | 'python' | 'cpp';

export interface Language {
  name: LanguageName;

  compileCmd: (files: string[]) => string[];
  runCmd: (files: string[]) => string[];
  extraFiles?: CodeFile[];

  extension: string;
  fileName: (name: string) => string;
  documentationUrl: string;
  codegen: (problem: GradedProblemModel) => CodeGenerator;
}

export const LANGUAGES: {
  [language in LanguageName]: Language;
} = Object.freeze({
  java: {
    name: 'java',
    compileCmd: files => ['javac'].concat(files),
    runCmd: files => ['java', files[0].substring(0, files[0].length - 5)],
    extension: 'java',
    fileName: CodegenUtils.toPascalCase,
    documentationUrl: 'https://docs.oracle.com/en/java/javase/11/docs/api/',
    codegen: problem => new JavaCodeGenerator(problem),
  },
  python: {
    name: 'python',
    compileCmd: files => ['pyflakes'].concat(files),
    runCmd: files => ['python3', files[0]],
    extraFiles: [new CodeFile('__init__.py', '')],
    extension: 'py',
    fileName: CodegenUtils.toSnakeCase,
    documentationUrl: 'https://docs.python.org/3.8/index.html',
    codegen: problem => new PythonCodeGenerator(problem),
  },
  cpp: {
    name: 'cpp',
    compileCmd: files => ['g++'].concat(files),
    runCmd: () => ['./a.out'],
    extension: 'cpp',
    fileName: CodegenUtils.toPascalCase,
    documentationUrl: 'http://www.cplusplus.com/reference/',
    codegen: problem => new CppCodeGenerator(problem),
  },
});
