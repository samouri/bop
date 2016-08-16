import _ from 'lodash'
import React from 'react';
import SongRow from './song-row';

export default class SongList extends React.Component {
  render() {
    var songRows = this.props.songs.map( (song, index) => {
      let selected = this.props.selectedVideoId === song.youtube_id;
      let playing = this.props.playing && selected;
      let upvoted = this.props.upvotes[ song._id ];

      return <li className="list-group-item" key={song.youtube_id}>
               <SongRow {...song} playing={playing} selected={selected} upvoted={upvoted}
                        onPause={this.props.onPause} onPlay={this.props.onPlay} onUpvote={this.props.onUpvote} />
             </li>
    });

    if (_.isEmpty(this.props.songs)) {
      songRows = <p> Theres a first for everything </p>
    }

    return (
      <div>
        <ul className="list-group">
          {songRows}
        </ul>
      </div>
    );
  }
}

