import { CodeGenerator } from './codegen';
import { Variable, VariableDimension, VariableType } from './models';
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

        %fn_ret% functionCallResult = %fn_name%(%fn_args%);
        %print%
    }
}`;

export class JavaCodeGenerator extends CodeGenerator {
  constructor(problem: GradedProblemModel) {
    super(problem, 8, FILE_TEMPLATE);
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
    let type;

    switch (variable.type) {
      case VariableType.STRING:
        type = 'String';
        break;
      case VariableType.INTEGER:
        type = 'int';
        break;
      case VariableType.FLOAT:
        type = 'double';
        break;
      case VariableType.BOOLEAN:
        type = 'boolean';
        break;
      case VariableType.CHARACTER:
        type = 'char';
        break;
    }

    if (variable.dimension === VariableDimension.ONE) {
      type += '[]';
    } else if (variable.dimension === VariableDimension.TWO) {
      type += '[][]';
    }

    return type;
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
      case VariableType.CHARACTER:
        return 's.nextLine().charAt(0);';
    }
  }

  getVariableDeclaration(variable: Variable): string {
    const variableType = this.getVariableType(variable);
    const variableTypeScalar = this.getVariableType({
      ...variable,
      dimension: VariableDimension.SCALAR,
    });
    const variableName = this.getVariableName(variable);

    if (variable.dimension === VariableDimension.SCALAR) {
      return `${variableType} ${variableName} = ${this.getVariableAssignment(
        variable
      )}`;
    } else if (variable.dimension === VariableDimension.ONE) {
      const counterName = `${variableName}Length`;
      return [
        `int ${counterName} = Integer.parseInt(s.nextLine());`,
        `${variableType} ${variableName} = new ${variableTypeScalar}[${counterName}];`,
        `for (int i = 0; i < ${counterName}; i++) {`,
        `    ${variableName}[i] = ${this.getVariableAssignment(variable)}`,
        `}`,
      ].join('\n' + ' '.repeat(this.mainIndentation));
    } else {
      const rowName = `${variableName}Row`;
      const colName = `${variableName}Col`;
      return [
        `int ${rowName} = Integer.parseInt(s.nextLine());`,
        `int ${colName} = Integer.parseInt(s.nextLine());`,
        `${variableType} ${variableName} = new ${variableTypeScalar}[${rowName}][${colName}];`,
        `for (int i = 0; i < ${rowName}; i++) {`,
        `    for (int j = 0; j < ${colName}; j++) {`,
        `        ${variableName}[i][j] = ${this.getVariableAssignment(
          variable
        )}`,
        `    }`,
        `}`,
      ].join('\n' + ' '.repeat(this.mainIndentation));
    }
  }

  getPrint(): string {
    if (this.problemVariable.dimension === VariableDimension.SCALAR) {
      return 'System.out.println(functionCallResult);';
    } else if (this.problemVariable.dimension === VariableDimension.ONE) {
      return [
        'for (int i = 0; i < functionCallResult.length; i++) {',
        '    System.out.println(functionCallResult[i]);',
        '}',
      ].join('\n' + ' '.repeat(this.mainIndentation));
    } else {
      return [
        'for (int i = 0; i < functionCallResult.length; i++) {',
        '    for (int j = 0; j < functionCallResult[i].length; j++) {',
        '        System.out.println(functionCallResult[i][j]);',
        '    }',
        '}',
      ].join('\n' + ' '.repeat(this.mainIndentation));
    }
  }
}
