import React, { Fragment } from 'react';
import { Consumer } from '@storybook/api';
import { styled } from '@storybook/theming';

import { Placeholder } from '@storybook/components';

import SyntaxHighlighter from './SyntaxHighlighter';
import style from 'react-syntax-highlighter/dist/esm/styles/hljs/github-gist';

import { PARAM_KEY } from './shared';

const StyledSyntaxHighlighter = styled(SyntaxHighlighter)(({ theme }) => ({
  fontSize: theme.typography.size.s2 - 1,
}));

const fileMatcher = ({ lang, matchFile }) => {
  if (!matchFile) {
    return str => str.endsWith(`.${lang}`);
  } else if (typeof matchFile === 'function') {
    return matchFile;
  } else if (typeof matchFile === 'string') {
    return str => str.endsWith(`.${matchFile}`);
  } else if (matchFile instanceof RegExp) {
    return str => matchFile.test(str);
  }
};

const mapper = ({ lang, matchFile }) => ({ state, api }) => {
  matchFile = fileMatcher({ lang, matchFile });
  const story = state.storiesHash[state.storyId];
  const paramValue = story && api.getParameters(story.id, PARAM_KEY);
  if (!paramValue) {
    return { sourceFiles: [] };
  }
  let sourceFiles = paramValue.sourceFiles.filter(({ path }) =>
    matchFile(path),
  );
  return { sourceFiles };
};

const CodePanel = ({ active, lang, label, matchFile }) => {
  if (!active) {
    return null;
  }
  return (
    <Consumer filter={mapper({ lang, matchFile })}>
      {({ sourceFiles }) => {
        return sourceFiles.length ? (
          <StyledSyntaxHighlighter
            language={lang || 'plaintext'}
            showLineNumbers="true"
            copyable={true}
            padded={true}
            style={style}
          >
            {sourceFiles.map(({ code }) => code).join('\n\n')}
          </StyledSyntaxHighlighter>
        ) : (
          // <Panel className="addon-code-container">
          // </Panel>
          <Placeholder>
            <Fragment>No {label} code</Fragment>
          </Placeholder>
        );
      }}
    </Consumer>
  );
};

export default CodePanel;
