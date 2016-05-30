import React from 'react';
import Track from './track.js';

const TrackList = React.createClass({
  render: function () {
    return <section>
             <h2>Here is my songs</h2>
             <Track />
             <Track />
           </section>;
  }
});

module.exports = TrackList;
