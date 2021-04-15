import { CodeGenerator } from './codegen';
import { Variable, VariableDimension, VariableType } from './models';
import { GradedProblemModel } from '../models/problem.model';
import { CodegenUtils } from './utils';

const FILE_TEMPLATE = `def %fn_name%(%fn_params%):
  # Your code here

if __name__ == '__main__':
  %declarations%

  function_call_result = %fn_name%(%fn_args%)
  %print%
`;

export class PythonCodeGenerator extends CodeGenerator {
  constructor(problem: GradedProblemModel) {
    super(problem, 2, FILE_TEMPLATE);
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
      case VariableType.CHARACTER:
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
      case VariableType.CHARACTER:
        return 'input()';
      case VariableType.INTEGER:
        return 'int(input())';
      case VariableType.FLOAT:
        return 'float(input())';
      case VariableType.BOOLEAN:
        return 'bool(input())';
    }
  }

  getVariableDeclaration(variable: Variable): string {
    const variableName = this.getVariableName(variable);

    if (variable.dimension === VariableDimension.SCALAR) {
      return `${variableName} = ${this.getVariableAssignment(variable)}`;
    } else if (variable.dimension === VariableDimension.ONE) {
      const counterName = `${variableName}_length`;
      return [
        `${counterName} = int(input())`,
        `${variableName} = []`,
        `for _ in range(${counterName}):`,
        `  ${variableName}.append(${this.getVariableAssignment(variable)})`,
      ].join('\n' + ' '.repeat(this.mainIndentation));
    } else {
      const rowName = `${variableName}_row`;
      const colName = `${variableName}_col`;
      return [
        `${rowName} = int(input());`,
        `${colName} = int(input());`,
        `${variableName} = []`,
        `for _ in range(${rowName}):`,
        `  ${variableName}.append([])`,
        `  for _ in range(${colName}):`,
        `    ${variableName}[-1].append(${this.getVariableAssignment(
          variable
        )})`,
      ].join('\n' + ' '.repeat(this.mainIndentation));
    }
  }

  getPrint(): string {
    if (this.problemVariable.dimension === VariableDimension.SCALAR) {
      return 'print(function_call_result)';
    } else if (this.problemVariable.dimension === VariableDimension.ONE) {
      return 'for x in function_call_result:\n    print(x)';
    } else {
      return [
        `for x in function_call_result:`,
        `  for y in x:`,
        `    print(y, end=' ')`,
        `  print()`,
      ].join('\n' + ' '.repeat(this.mainIndentation));
    }
  }
}
