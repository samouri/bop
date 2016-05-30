import React from 'react';
/*
 * Title contains both the App Title (Bop) and the location / playlist name
 */
const LocalTitle = (props) =>
    <span>
      <span style={{color:'purple'}}>Bop</span>
      <span style={{color:'grey'}}>&nbsp;|&nbsp;{props.location}</span>
    </span>;

module.exports = LocalTitle;
