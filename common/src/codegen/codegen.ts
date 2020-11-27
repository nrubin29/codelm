import { Variable } from './models';
import { GradedProblemModel } from '../models/problem.model';

export abstract class CodeGenerator {
  constructor(protected problem: GradedProblemModel) {}

  protected abstract generateBefore(): string;
  protected abstract generateFunctionHeader(): string;
  protected abstract generateMain(): string;
  protected abstract generateAfter(): string;

  generate(): string {
    return [
      this.generateBefore(),
      this.generateFunctionHeader(),
      this.generateMain(),
      this.generateAfter(),
    ].join('\n');
  }

  protected abstract generateVariableDeclaration(variable: Variable): string;
  protected abstract generateVariableAssignment(variable: Variable): string;
  protected abstract generateIdentifier(name: string): string;
}
