import ts from 'typescript';

type MutationTarget = ts.ImportDeclaration & { moduleSpecifier: ts.StringLiteral };

const shouldMutate = (node: ts.Node): node is MutationTarget => {
  return (
    !ts.isTypeOnlyImportOrExportDeclaration(node) &&
    ts.isImportDeclaration(node) &&
    node.moduleSpecifier &&
    ts.isStringLiteral(node.moduleSpecifier) &&
    node.moduleSpecifier.text.startsWith('lodash') &&
    !node.moduleSpecifier.text.startsWith('lodash-es')
  );
};

export default (): ts.TransformerFactory<ts.SourceFile> => context => {
  const visitNode: ts.Transformer<ts.Node> = node => {
    if (!shouldMutate(node)) return ts.visitEachChild(node, visitNode, context);

    return context.factory.updateImportDeclaration(
      node,
      node.decorators,
      node.modifiers,
      node.importClause,
      ts.createLiteral(node.moduleSpecifier.text.replace('lodash', 'lodash-es'))
    );
  };

  return source => ts.visitNode(source, visitNode);
};
