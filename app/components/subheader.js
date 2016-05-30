import React from 'react';
import FilterSwitch from './filterswitch.js';
import AddButton from './addbutton.js';

const SubHeader = React.createClass({
  render: function () {
    return <section style={{border: '1px solid black'}}>
             <FilterSwitch />
             <AddButton />
           </section>;
  }
});

module.exports = SubHeader;
