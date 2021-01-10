import { Variable } from './models';
import { GradedProblemModel } from '../models/problem.model';
import { CodegenUtils } from './utils';

export abstract class CodeGenerator {
  protected constructor(
    protected problem: GradedProblemModel,
    private mainIndentation: number,
    private fileTemplate: string,
    private declarationTemplate: string
  ) {}

  generate(): string {
    return this.fileTemplate
      .replace(/%prob_name%/g, this.getProblemName())
      .replace(/%fn_ret%/g, this.getFunctionReturn())
      .replace(/%fn_name%/g, this.getFunctionName())
      .replace(/%fn_params%/g, this.getFunctionParams())
      .replace(/%fn_args%/g, this.getFunctionArgs())
      .replace(
        /%declarations%/g,
        this.problem.variables
          .map(variable =>
            this.declarationTemplate
              .replace(/%var_type%/g, this.getVariableType(variable))
              .replace(/%var_name%/g, this.getVariableName(variable))
              .replace(/%var_assign%/g, this.getVariableAssignment(variable))
          )
          .join('\n' + ' '.repeat(this.mainIndentation))
      );
  }

  getProblemName(): string {
    return CodegenUtils.toPascalCase(this.problem.title);
  }

  getFunctionReturn(): string {
    return this.getVariableType({
      type: this.problem.returnType,
      name: undefined,
    });
  }

  abstract getFunctionName(): string;
  abstract getFunctionParams(): string;
  abstract getFunctionArgs(): string;
  abstract getVariableType(variable: Variable): string;
  abstract getVariableName(variable: Variable): string;
  abstract getVariableAssignment(variable: Variable): string;
}
