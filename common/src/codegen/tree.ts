import { Variable, VariableType } from './models';

export abstract class TreeNode {
  depth = 0;

  protected constructor(public name: string) {}
}

export class RootNode extends TreeNode {
  constructor(public children: TreeNode[]) {
    super('root');
  }
}

export class FileNode extends TreeNode {
  constructor(public className: string, public children: TreeNode[]) {
    super('file');
  }
}

export class PreambleNode extends TreeNode {
  constructor() {
    super('preamble');
  }
}

export class FunctionDeclarationNode extends TreeNode {
  constructor(
    private functionVariable: Variable,
    private params: Variable[],
    public children: TreeNode[]
  ) {
    super('functionDeclaration');
    this.children.forEach(child => {
      child.depth += 1;
    });
  }

  get variableTypeNode() {
    return new VariableTypeNode(this.functionVariable.type);
  }

  get variableNameNode() {
    return new VariableNameNode(this.functionVariable.name);
  }

  get paramNodes() {
    return this.params.map(param => new VariableDeclarationNode(param));
  }
}

export class CommentNode extends TreeNode {
  constructor(public comment: string) {
    super('comment');
  }
}

export class MainNode extends TreeNode {
  constructor(public children: TreeNode[]) {
    super('main');
    this.children.forEach(child => {
      child.depth += 1;
    });
  }
}

export class VariableDeclarationNode extends TreeNode {
  constructor(public variable: Variable) {
    super('variableDeclaration');
  }

  get variableTypeNode() {
    return new VariableTypeNode(this.variable.type);
  }

  get variableNameNode() {
    return new VariableNameNode(this.variable.name);
  }
}

export class VariableAssignmentNode extends TreeNode {
  constructor(private variable: Variable) {
    super('variableAssignment');
  }

  get variableTypeNode() {
    return new VariableTypeNode(this.variable.type);
  }

  get variableNameNode() {
    return new VariableNameNode(this.variable.name);
  }

  get variableInitializerNode() {
    return new VariableInitializerNode(this.variable.type);
  }
}

export class VariableTypeNode extends TreeNode {
  constructor(public variableType: VariableType) {
    super('variableType');
  }
}

export class VariableNameNode extends TreeNode {
  constructor(public variableName: string) {
    super('variableName');
  }
}

export class VariableInitializerNode extends TreeNode {
  constructor(public variableType: VariableType) {
    super('variableInitializer');
  }
}
