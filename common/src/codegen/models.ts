export enum VariableType {
  STRING,
  INTEGER,
  FLOAT,
}

export interface Variable {
  name: string;
  type: VariableType;
  array: boolean;
}
