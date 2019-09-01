import {readFile, writeFile} from "fs-extra";

export class CodeFile {
  constructor(public name: string, public code: string) { }

  static async fromFile(name: string, path: string): Promise<CodeFile> {
    const data = await readFile(path);
    return new CodeFile(name, data.toString());
  }

  mkfile(folderPath: string): Promise<void> {
    return writeFile(folderPath + '/' + this.name, this.code);
  }
}