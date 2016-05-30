import TrackList from './tracklist.js';
import SubHeader from './subheader.js';
import VideoBar from './videobar.js';
import LocalHeader from './localheader.js';
import React from 'react';

const BopPlayer = React.createClass({
  render: function () {
    return <div><LocalHeader /><VideoBar /><SubHeader /><TrackList /></div>;
  }
});

module.exports = BopPlayer;
