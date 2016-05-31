import React from 'react';
import LocalTitle from './localtitle.js';
import SettingsMenu from './settingsmenu.js';

/*
 * DISCLAIMER: I have no idea if this separation is a good idea or not, 
 * but it gives me the warm fuzzies for now.
 */
const LocalHeaderJSX = (props) =>
  <header style={props.style}>
    <LocalTitle location={props.location}/>
    <SettingsMenu style={{float:'right',color:'grey'}}/>
  </header>;

class LocalHeader extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <LocalHeaderJSX location="Seattle"/>;
  }
};

module.exports = LocalHeader;
