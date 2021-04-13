import { Variable } from './models';
import { GradedProblemModel } from '../models/problem.model';
import { CodegenUtils } from './utils';

export abstract class CodeGenerator {
  protected constructor(
    protected problem: GradedProblemModel,
    protected mainIndentation: number,
    private fileTemplate: string
  ) {}

  generate(): string {
    return this.fileTemplate
      .replace(/%prob_name%/g, this.getProblemName())
      .replace(/%fn_ret%/g, this.getVariableType(this.problemVariable))
      .replace(/%fn_name%/g, this.getFunctionName())
      .replace(/%fn_params%/g, this.getFunctionParams())
      .replace(/%fn_args%/g, this.getFunctionArgs())
      .replace(/%print%/g, this.getPrint())
      .replace(
        /%declarations%/g,
        this.problem.variables
          .map(variable => this.getVariableDeclaration(variable))
          .join('\n' + ' '.repeat(this.mainIndentation))
      );
  }

  getProblemName(): string {
    return CodegenUtils.toPascalCase(this.problem.title);
  }

  get problemVariable(): Variable {
    return {
      type: this.problem.returnType,
      name: this.getProblemName(),
      dimension: this.problem.returnDimension,
    };
  }

  abstract getFunctionName(): string;
  abstract getFunctionParams(): string;
  abstract getFunctionArgs(): string;
  abstract getVariableType(variable: Variable): string;
  abstract getVariableName(variable: Variable): string;
  abstract getVariableAssignment(variable: Variable): string;
  abstract getVariableDeclaration(variable: Variable): string;
  abstract getPrint(): string;
}
