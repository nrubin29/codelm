import {writeFile} from "fs-extra";

export const FOLDER = 'code';

export class CodeFile {
  constructor(public name: string, public code: string) { }

  mkfile(): Promise<void> {
    return writeFile(`${FOLDER}/${this.name}`, this.code);
  }
}
