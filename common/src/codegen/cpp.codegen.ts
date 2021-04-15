import { CodeGenerator } from './codegen';
import { Variable, VariableDimension, VariableType } from './models';
import { GradedProblemModel } from '../models/problem.model';
import { CodegenUtils } from './utils';

const FILE_TEMPLATE = `#include <iostream>

using namespace std;

int main() {
  %declarations%
  
  // BEGIN: your code
  // Name the variable that contains the answer \`result\`.
  
  // END: your code

  %print%
}`;

export class CppCodeGenerator extends CodeGenerator {
  constructor(problem: GradedProblemModel) {
    super(problem, 2, FILE_TEMPLATE);
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
        type = 'string';
        break;
      case VariableType.INTEGER:
        type = 'int';
        break;
      case VariableType.FLOAT:
        type = 'double';
        break;
      case VariableType.BOOLEAN:
        type = 'bool';
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
    if (variable.type === VariableType.STRING) {
      return `getline(cin, ${this.getVariableName(variable)});`;
    }

    return `cin >> ${this.getVariableName(variable)};`;
  }

  private getVariableAssignmentWithSuffix(
    variable: Variable,
    suffix: string
  ): string {
    if (variable.type === VariableType.STRING) {
      return `cin >> ws; getline(cin, ${this.getVariableName(
        variable
      )}${suffix});`;
    }

    return `cin >> ${this.getVariableName(variable)}${suffix};`;
  }

  getVariableDeclaration(variable: Variable): string {
    const variableName = this.getVariableName(variable);
    const variableType = this.getVariableType(variable);
    const scalarVariableType = this.getVariableType({
      ...variable,
      dimension: VariableDimension.SCALAR,
    });

    if (variable.dimension === VariableDimension.SCALAR) {
      return `${variableType} ${variableName};\n  ${this.getVariableAssignment(
        variable
      )}`;
    } else if (variable.dimension === VariableDimension.ONE) {
      const counterName = `${variableName}Length`;
      return [
        `int ${counterName};`,
        `cin >> ${counterName};`,
        `${scalarVariableType} ${variableName}[${counterName}];`,
        `for (int i = 0; i < ${counterName}; i++) {`,
        `  ${this.getVariableAssignmentWithSuffix(variable, '[i]')}`,
        `}`,
      ].join('\n' + ' '.repeat(this.mainIndentation));
    } else {
      const rowName = `${variableName}Row`;
      const colName = `${variableName}Col`;
      return [
        `int ${rowName};`,
        `cin >> ${rowName};`,
        `int ${colName};`,
        `cin >> ${colName};`,
        `${scalarVariableType} ${variableName}[${rowName}][${colName}];`,
        `for (int i = 0; i < ${rowName}; i++) {`,
        `  for (int j = 0; j < ${colName}; j++) {`,
        `    ${this.getVariableAssignmentWithSuffix(variable, '[i][j]')}`,
        `  }`,
        `}`,
      ].join('\n' + ' '.repeat(this.mainIndentation));
    }
  }

  getPrint(): string {
    if (this.problemVariable.dimension === VariableDimension.SCALAR) {
      return 'cout << result;';
    } else if (this.problemVariable.dimension === VariableDimension.ONE) {
      return [
        'int resultLength = sizeof(result) / sizeof(result[0]);',
        'for (int i = 0; i < resultLength; i++) {',
        '  cout << result[i] << endl;',
        '}',
      ].join('\n' + ' '.repeat(this.mainIndentation));
    } else {
      return [
        'int resultLength = sizeof(result) / sizeof(result[0]);',
        'for (int i = 0; i < resultLength; i++) {',
        '  int resultLengthInner = sizeof(result[i]) / sizeof(result[i][0]);',
        '  for (int j = 0; j < resultLengthInner; j++) {',
        '    cout << result[i][j] << " ";',
        '  }',
        '  cout << endl;',
        '}',
      ].join('\n' + ' '.repeat(this.mainIndentation));
    }
  }
}
