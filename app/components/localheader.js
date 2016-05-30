import React from 'react';
import LocalTitle from './localtitle.js';
import SettingsMenu from './settingsmenu.js';

const LocalHeader = React.createClass({
  render: function () {
    return <header style={{border: '1px solid black'}}>
             <LocalTitle />
             <SettingsMenu />
           </header>;
  }
});

module.exports = LocalHeader;
