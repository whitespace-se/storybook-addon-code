# Storybook Addon Code

This addon for Storybook allows you to display the source code for your components. It uses [highlight.js](https://highlightjs.org/) for syntax highlighting. [Available languages are listed here](https://github.com/conorhastings/react-syntax-highlighter/blob/master/AVAILABLE_LANGUAGES_HLJS.MD).

**NOTE**: This addon can only be used with the new [Component Story Format (CSF)](https://storybook.js.org/docs/formats/component-story-format/) introduced in Storybook 5.2.

## Getting Started

```sh
npm i --save-dev @whitespace/storybook-addon-code
```

### Register addon

Create a file called `addons.js` in your storybook config and add the following content:

```js
import registerAddonCode from '@whitespace/storybook-addon-code/register';

registerAddonCode({
  tabs: [
    { label: 'Twig', lang: 'twig' },
    { label: 'Sass', lang: 'scss' },
    { label: 'JavaScript', lang: 'javascript', matchFiles: 'js' },
  ],
});
```

`tabs` should be an array with objects for each tab you want to add to the addon panel. Each object can contain these properties:

- `label`: The displayed label on the tab.
- `lang`: The language as defined by highlight.js. [Available languages are listed here](https://github.com/conorhastings/react-syntax-highlighter/blob/master/AVAILABLE_LANGUAGES_HLJS.MD)
- `matchFiles`: Optional. Defaults to the same value as `lang`. Can be a string representing the file extension for files that should be included. Can also be a regular expression to test the filename against. Can also be function that receives the filename and returns true or false.

### Add the Webpack loader

Update or create `webpack.config.js` inside your `.storybook` directory by adding `require.resolve('@whitespace/storybook-addon-code/loader')` as a pre-loader to `.stories.js` files as shown below.

```js
module.exports = async ({ config, mode }) => {
  // ...

  config.module.rules.push({
    test: /\.stories\.jsx?$/,
    loaders: [
      /*
      This loader should be first in the list unless you
      want tranfromations from other loaders to affect
      what’s shown in the code tabs
      */
      require.resolve('@whitespace/storybook-addon-code/loader'),
      // ...
    ],
    enforce: 'pre',
  });

  // ...

  // Return the altered config
  return config;
};
```

## Usage

The imported files inside the `.stories.js` file that matches the registered tabs will be extracted automatically. Install and use [null-loader](https://www.npmjs.com/package/null-loader) to include files that are not required by the actual stories file.

```js
import Component from './button.twig';
import '!!null-loader!./button.scss';

export default {
  title: 'Example button',
};

export const withUrl = () =>
  Component({
    text: 'Lorem ipsum',
    url: '#',
  });

export const withoutUrl = () =>
  Component({
    text: 'Lorem ipsum',
  });
```
