export enum VariableType {
  STRING = 'String',
  INTEGER = 'Integer',
  FLOAT = 'Float',
  BOOLEAN = 'Boolean',
}

export interface Variable {
  name: string;
  type: VariableType;
}
