export class CodegenUtils {
  static toPascalCase(name: string) {
    return name
      .split(' ')
      .map(part => part[0].toUpperCase() + part.substring(1).toLowerCase())
      .join('');
  }

  static toCamelCase(name: string) {
    const pascalCase = CodegenUtils.toPascalCase(name);
    return pascalCase[0].toLowerCase() + pascalCase.substring(1);
  }

  static toSnakeCase(name: string) {
    return name
      .split(' ')
      .map(part => part.toLowerCase())
      .join('_');
  }
}
