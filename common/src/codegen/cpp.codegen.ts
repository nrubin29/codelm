import { CodeGenerator } from './codegen';
import { Variable, VariableType } from './models';
import { GradedProblemModel } from '../models/problem.model';
import { CodegenUtils } from './utils';

const FILE_TEMPLATE = `#include <iostream>

using namespace std;

%fn_ret% %fn_name%(%fn_params%) {
  // Your code here
}

int main() {
  %declarations%

  cout << %fn_name%(%fn_args%);
}`;

const DECLARATION_TEMPLATE = `%var_type% %var_name%;\n  %var_assign%`;

export class CppCodeGenerator extends CodeGenerator {
  constructor(problem: GradedProblemModel) {
    super(problem, 2, FILE_TEMPLATE, DECLARATION_TEMPLATE);
  }

  getFunctionName(): string {
    return CodegenUtils.toCamelCase(this.problem.title);
  }

  getFunctionParams(): string {
    return this.problem.variables
      .map(variable =>
        [this.getVariableType(variable), this.getVariableName(variable)].join(
          ' '
        )
      )
      .join(', ');
  }

  getFunctionArgs(): string {
    return this.problem.variables
      .map(variable => this.getVariableName(variable))
      .join(', ');
  }

  getVariableType(variable: Variable): string {
    switch (variable.type) {
      case VariableType.STRING:
        return 'string';
      case VariableType.INTEGER:
        return 'int';
      case VariableType.FLOAT:
        return 'double';
      case VariableType.BOOLEAN:
        return 'bool';
    }
  }

  getVariableName(variable: Variable): string {
    return CodegenUtils.toCamelCase(variable.name);
  }

  getVariableAssignment(variable: Variable): string {
    return `cin >> ${this.getVariableName(variable)};`;
  }
}
