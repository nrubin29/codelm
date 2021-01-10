import { CodeGenerator } from './codegen';
import { Variable, VariableType } from './models';
import { GradedProblemModel } from '../models/problem.model';
import { CodegenUtils } from './utils';

const FILE_TEMPLATE = `import java.util.Scanner;

class %prob_name% {
  static %fn_ret% %fn_name%(%fn_params%) {
    // Your code here
  }

  public static void main(String[] args) {
    Scanner s = new Scanner(System.in);

    %declarations%

    System.out.println(%fn_name%(%fn_args%));
  }
}`;

const DECLARATION_TEMPLATE = `%var_type% %var_name% = %var_assign%`;

export class JavaCodeGenerator extends CodeGenerator {
  constructor(problem: GradedProblemModel) {
    super(problem, 4, FILE_TEMPLATE, DECLARATION_TEMPLATE);
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
        return 'String';
      case VariableType.INTEGER:
        return 'int';
      case VariableType.FLOAT:
        return 'double';
      case VariableType.BOOLEAN:
        return 'boolean';
    }
  }

  getVariableName(variable: Variable): string {
    return CodegenUtils.toCamelCase(variable.name);
  }

  getVariableAssignment(variable: Variable): string {
    switch (variable.type) {
      case VariableType.STRING:
        return 's.nextLine();';
      case VariableType.INTEGER:
        return 'Integer.parseInt(s.nextLine());';
      case VariableType.FLOAT:
        return 'Double.parseDouble(s.nextLine());';
      case VariableType.BOOLEAN:
        return 'Boolean.parseBoolean(s.nextLine());';
    }
  }
}
