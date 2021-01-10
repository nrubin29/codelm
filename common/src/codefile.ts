export const CODE_FOLDER = 'code';

export class CodeFile {
  constructor(public name: string, public code: string) {}

  get path(): string {
    return `${CODE_FOLDER}/${this.name}`;
  }
}
