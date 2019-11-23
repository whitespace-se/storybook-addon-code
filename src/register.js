import React from 'react';
import addons from '@storybook/addons';
import Panel from './Panel';

export default ({ tabs = [] }) => {
  const tabsToRender = [].concat(tabs);
  addons.register('jfrk/code', api => {
    tabsToRender.forEach(({ label, lang, matchFiles }) => {
      addons.add(`jfrk/code/${lang}/panel`, {
        type: 'panel',
        title: label,
        render: ({ active, key }) => (
          <Panel
            active={active}
            api={api}
            channel={addons.getChannel()}
            key={key}
            label={label}
            lang={lang}
            matchFiles={matchFiles}
          />
        ),
      });
    });
  });
};
