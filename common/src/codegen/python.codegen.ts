import { CodeGenerator } from './codegen';
import { Variable, VariableType } from './models';
import { GradedProblemModel } from '../models/problem.model';
import { CodegenUtils } from './utils';

const FILE_TEMPLATE = `def %fn_name%(%fn_params%):
  # Your code here

if __name__ == '__main__':
  %declarations%

  print(%fn_name%(%fn_args%))`;

const DECLARATION_TEMPLATE = `%var_name% = %var_assign%`;

export class PythonCodeGenerator extends CodeGenerator {
  constructor(problem: GradedProblemModel) {
    super(problem, 2, FILE_TEMPLATE, DECLARATION_TEMPLATE);
  }

  getFunctionName(): string {
    return CodegenUtils.toSnakeCase(this.problem.title);
  }

  getFunctionParams(): string {
    return this.problem.variables
      .map(variable => this.getVariableName(variable))
      .join(', ');
  }

  getFunctionArgs(): string {
    return this.getFunctionParams();
  }

  getVariableType(variable: Variable): string {
    switch (variable.type) {
      case VariableType.STRING:
        return 'str';
      case VariableType.INTEGER:
        return 'int';
      case VariableType.FLOAT:
        return 'float';
      case VariableType.BOOLEAN:
        return 'bool';
    }
  }

  getVariableName(variable: Variable): string {
    return CodegenUtils.toSnakeCase(variable.name);
  }

  getVariableAssignment(variable: Variable): string {
    switch (variable.type) {
      case VariableType.STRING:
        return 'input()';
      case VariableType.INTEGER:
        return 'int(input())';
      case VariableType.FLOAT:
        return 'float(input())';
      case VariableType.BOOLEAN:
        return 'bool(input())';
    }
  }
}
