import { parse } from '@babel/parser';
import generate from '@babel/generator';
import estraverse from 'estraverse';
import {
  PARAM_KEY,
  STORY_GROUP_DEFAULT_EXPORT_IDENTIFIER as DEFAULT_EXPORT,
  SOURCE_FILE_IMPORT_IDENTIFIER_PREFIX,
} from './shared';

export function getSourceFiles(ast) {
  const sourceFiles = [];
  let index = 0;
  estraverse.traverse(ast, {
    fallback: 'iteration',
    enter: node => {
      if (node.type === 'ImportDeclaration') {
        sourceFiles.push({
          path: node.source.value.replace(/^.*!/, ''),
          id: SOURCE_FILE_IMPORT_IDENTIFIER_PREFIX + index,
        });
        index++;
      }
    },
  });
  return sourceFiles;
}
export function addStoryGroupParam(ast, { sourceFiles = [] } = {}) {
  // Moves the default export declaration to a variable
  estraverse.replace(ast, {
    fallback: 'iteration',
    enter: node => {
      if (node.type === 'Program' && node.body) {
        // Finds the default export statement
        let exportDefaultDeclarationIndex = node.body.findIndex(
          childNode => childNode.type === 'ExportDefaultDeclaration',
        );

        if (~exportDefaultDeclarationIndex) {
          let exportDefaultDeclarationNode =
            node.body[exportDefaultDeclarationIndex];
          // Copies the default export declaration to a variable
          node.body.splice(exportDefaultDeclarationIndex, 0, {
            type: 'VariableDeclaration',
            kind: 'var',
            declarations: [
              {
                type: 'VariableDeclarator',
                id: {
                  type: 'Identifier',
                  name: DEFAULT_EXPORT,
                },
                init: exportDefaultDeclarationNode.declaration,
              },
            ],
          });

          // Adds story group parameter, containing array of all source files
          let addStoryGroupParamStatements = parse(`
            ${DEFAULT_EXPORT}.parameters = ${DEFAULT_EXPORT}.parameters || {};
            ${DEFAULT_EXPORT}.parameters.${PARAM_KEY} = {
              sourceFiles: [
                ${sourceFiles.map(
                  ({ path, id }) => `{
                    path: ${JSON.stringify(path)},
                    code: ${id}
                  }`,
                )}
              ]
            };
          `).program.body;

          node.body.splice(
            exportDefaultDeclarationIndex + 2,
            0,
            ...addStoryGroupParamStatements,
          );
        } else {
          // TODO
        }
        return node;
      } else if (node.type === 'ExportDefaultDeclaration') {
        // Replaces the default export declaration with the variable identifier
        node.declaration = {
          type: 'Identifier',
          name: DEFAULT_EXPORT,
        };
        return node;
      }
    },
  });
}

export default function(source) {
  const ast = parse(source, { sourceType: 'module' });
  const sourceFiles = getSourceFiles(ast);
  addStoryGroupParam(ast, { sourceFiles });
  const sourceFileImportStatements = sourceFiles.map(({ path, id }) => {
    return `import ${id} from ${JSON.stringify(`!!raw-loader!${path}`)}`;
  });
  return `
    ${sourceFileImportStatements.join('\n')}
    ${generate(ast).code}
  `;
}
