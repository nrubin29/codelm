export enum VariableType {
  STRING = 'String',
  INTEGER = 'Integer',
  FLOAT = 'Float',
  BOOLEAN = 'Boolean',
  CHARACTER = 'Character',
}

export enum VariableDimension {
  SCALAR = 'Scalar',
  ONE = '1D Array',
  TWO = '2D Array',
}

export interface Variable {
  name: string;
  type: VariableType;
  dimension: VariableDimension;
}
