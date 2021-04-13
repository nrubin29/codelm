import { CodeGenerator } from './codegen';
import { VariableType } from './models';
import { GradedProblemModel } from '../models/problem.model';
import { CodegenUtils } from './utils';
import {
  FileNode,
  PreambleNode,
  FunctionDeclarationNode,
  CommentNode,
  MainNode,
  VariableDeclarationNode,
  RootNode,
  VariableAssignmentNode,
  VariableInitializerNode,
  VariableNameNode,
  VariableTypeNode,
} from './tree';

export class JavaCodeGenerator extends CodeGenerator {
  visitRootNode(node: RootNode): string {
    return node.children.map(child => this.visit(child)).join('\n');
  }

  visitFileNode(node: FileNode): string {
    return `class ${node.className} {\n${node.children
      .map(child => this.visit(child))
      .join('\n')}\n}`;
  }

  visitPreambleNode(preambleNode: PreambleNode): string {
    return 'import java.util.Scanner;';
  }

  visitFunctionDeclarationNode(node: FunctionDeclarationNode): string {
    return `static ${this.visit(
      node.variableTypeNode
    )} ${this.visitVariableNameNode(
      node.variableNameNode
    )}(${node.paramNodes
      .map(paramNode => this.visit(paramNode))
      .join(', ')}) { ${node.children.map(child => this.visit(child))} }`;
  }

  visitCommentNode(node: CommentNode): string {
    return `// ${node.comment}`;
  }

  visitMainNode(mainNode: MainNode): string {
    return `public static void main(String[] args) { ${mainNode.children
      .map(child => this.visit(child))
      .join('\n')} }`;
  }

  visitVariableDeclarationNode(node: VariableDeclarationNode): string {
    return `${this.visit(node.variableTypeNode)} ${this.visit(
      node.variableNameNode
    )};`;
  }

  visitVariableAssignmentNode(node: VariableAssignmentNode): string {
    return `${this.visit(node.variableTypeNode)} ${this.visit(
      node.variableNameNode
    )} = ${this.visit(node.variableInitializerNode)};`;
  }

  visitVariableTypeNode(node: VariableTypeNode): string {
    switch (node.variableType) {
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

  visitVariableNameNode(node: VariableNameNode): string {
    return CodegenUtils.toCamelCase(node.variableName);
  }

  visitVariableInitializerNode(node: VariableInitializerNode): string {
    switch (node.variableType) {
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

  constructor(problem: GradedProblemModel) {
    super(problem);
  }
}
