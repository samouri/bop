import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import * as cx from "classnames";

import SongRow from "./song-row";

import { setSort, SORT } from "../state/actions";
import { getSongsInStream, getCurrentPlayer } from "../state/reducer";

class SongList extends React.Component<any> {
  renderSongsList = () => {
    let { songs, stream, newSongs } = this.props;
    if (!_.isEmpty(newSongs)) {
      songs = newSongs;
    }

    if (_.isEmpty(songs)) {
      return <p> Theres a first for everything </p>;
    } else {
      return _.map(songs, (song: any) => (
        <SongRow key={song.id} songId={song.id} stream={stream} />
      ));
    }
  };

  setSortHandler = (sort: SORT) => () => {
    this.props.dispatch(setSort({ sort }));
  };

  render() {
    const { sort } = this.props;

    const ret = (
      <div>
        <div className="header-row">
          <span className="play-info" />
          <span
            className={cx("pointer vote-info", { active: sort === "votes" })}
            onClick={this.setSortHandler("votes")}
          >
            VOTES
          </span>
          <span
            className={cx("song-title pointer", { active: sort === "title" })}
            onClick={this.setSortHandler("title")}
          >
            TITLE
          </span>
          <span
            className={cx("song-artist pointer", { active: sort === "artist" })}
            onClick={this.setSortHandler("artist")}
          >
            ARIST
          </span>
          <span
            className={cx("song-artist pointer", {
              active: sort === "playlist",
            })}
            onClick={this.setSortHandler("playlist")}
          >
            PLAYLIST
          </span>
          <span
            className={cx("song-date pointer", { active: sort === "date" })}
            onClick={this.setSortHandler("date")}
          >
            POSTED
          </span>
          <span
            className={cx("song-postee pointer", { active: sort === "user" })}
            onClick={this.setSortHandler("user")}
          >
            USER
          </span>
          <span
            className={cx("song-duration pointer", {
              active: sort === "duration",
            })}
            onClick={this.setSortHandler("duration")}
          >
            <i className="fa fa-lg fa-clock-o" />
          </span>
        </div>

        {this.renderSongsList()}
      </div>
    );
    return ret;
  }
}

export default connect((state, ownProps: any) => {
  const { stream } = ownProps;
  const { sort } = getCurrentPlayer(state);

  return {
    songs: getSongsInStream(state, { ...stream, sort }),
    sort,
  };
})(SongList);
