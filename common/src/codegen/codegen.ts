import { Variable } from './models';
import { GradedProblemModel } from '../models/problem.model';
import { CodegenUtils } from './utils';
import {
  CommentNode,
  FileNode,
  FunctionDeclarationNode,
  MainNode,
  PreambleNode,
  RootNode,
  TreeNode,
  VariableAssignmentNode,
  VariableDeclarationNode,
  VariableInitializerNode,
  VariableNameNode,
  VariableTypeNode,
} from './tree';

export abstract class CodeGenerator {
  protected constructor(protected problem: GradedProblemModel) {}

  generate(): string {
    return this.visit(
      new RootNode([
        new FileNode(this.problem.title, [
          new PreambleNode(),
          new FunctionDeclarationNode(
            this.problemVariable,
            this.problem.variables,
            [new CommentNode('Your code here')]
          ),
          new MainNode(
            this.problem.variables.map(
              variable => new VariableAssignmentNode(variable)
            )
          ),
        ]),
      ])
    );
  }

  visit(node: TreeNode): string {
    switch (node.name) {
      case 'root':
        return this.visitRootNode(node as RootNode);
      case 'file':
        return this.visitFileNode(node as FileNode);
      case 'preamble':
        return this.visitPreambleNode(node as PreambleNode);
      case 'functionDeclaration':
        return this.visitFunctionDeclarationNode(
          node as FunctionDeclarationNode
        );
      case 'comment':
        return this.visitCommentNode(node as CommentNode);
      case 'main':
        return this.visitMainNode(node as MainNode);
      case 'variableDeclaration':
        return this.visitVariableDeclarationNode(
          node as VariableDeclarationNode
        );
      case 'variableAssignment':
        return this.visitVariableAssignmentNode(node as VariableAssignmentNode);
      case 'variableType':
        return this.visitVariableTypeNode(node as VariableTypeNode);
      case 'variableName':
        return this.visitVariableNameNode(node as VariableNameNode);
      case 'variableInitializer':
        return this.visitVariableInitializerNode(
          node as VariableInitializerNode
        );
    }
  }

  abstract visitRootNode(node: RootNode): string;
  abstract visitFileNode(node: FileNode): string;
  abstract visitPreambleNode(node: PreambleNode): string;
  abstract visitFunctionDeclarationNode(node: FunctionDeclarationNode): string;
  abstract visitCommentNode(node: CommentNode): string;
  abstract visitMainNode(node: MainNode): string;
  abstract visitVariableDeclarationNode(node: VariableDeclarationNode): string;
  abstract visitVariableAssignmentNode(node: VariableAssignmentNode): string;
  abstract visitVariableTypeNode(node: VariableTypeNode): string;
  abstract visitVariableNameNode(node: VariableNameNode): string;
  abstract visitVariableInitializerNode(node: VariableInitializerNode): string;

  getProblemName(): string {
    return CodegenUtils.toPascalCase(this.problem.title);
  }

  get problemVariable(): Variable {
    return {
      type: this.problem.returnType,
      name: this.getProblemName(),
      dimension: this.problem.returnDimension,
    };
  }
}
