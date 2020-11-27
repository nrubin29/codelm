import { CodeGenerator } from './codegen';
import { Variable, VariableType } from './models';

export class PythonCodeGenerator extends CodeGenerator {
  protected generateBefore(): string {
    return '';
  }

  protected generateFunctionHeader(): string {
    const problemName = this.problem.title.replace(' ', '_').toLowerCase();
    const variables = this.problem.variables.map(variable =>
      this.generateIdentifier(variable.name)
    );

    return `def ${problemName}(${variables}):`;
  }

  protected generateMain(): string {
    const declarations = this.problem.variables.map(variable =>
      this.generateVariableDeclaration(variable)
    );

    return `if __name__ == '__main__':\n\t${declarations}`;
  }

  protected generateAfter(): string {
    return '';
  }

  protected generateVariableDeclaration(variable: Variable): string {
    return variable.name;
  }

  protected generateVariableAssignment(variable: Variable): string {
    let expr;

    switch (variable.type) {
      case VariableType.STRING:
        expr = 'input()';
        break;
      case VariableType.INTEGER:
        expr = 'int(input())';
        break;
      case VariableType.FLOAT:
        expr = 'float(input())';
        break;
    }

    // TODO: handle arrays.

    return variable.name + ' = ' + expr;
  }

  protected generateIdentifier(name: string): string {
    return name.replace(/\W/g, '_').replace(/_{2,}/g, '_').toLowerCase();
  }
}
