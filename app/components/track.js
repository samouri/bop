import React from 'react';
import OvalPic from './ovalpic.js';
import TrackInfo from './trackinfo.js';
import Upvotes from './upvotes.js';
import PlayPause from './playpause.js';

const Track = React.createClass({
  render: function () {
    return <div style={{border: '1px solid black'}}>
             <OvalPic />
             <TrackInfo />
             <Upvotes />
             <PlayPause />
           </div>;
  }
});

module.exports = Track;
