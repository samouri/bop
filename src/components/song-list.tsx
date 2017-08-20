import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';

import SongRow from './song-row';

import { fetchSongsInPlaylist, setSort, SORT } from '../state/actions';
import { getSortedSongsDenormalized, getCurrentPlaylist } from '../state/reducer';

class SongList extends React.Component<any> {
	fetchSongs = _.throttle(
		(props = this.props) => props.dispatch(fetchSongsInPlaylist({ playlistId: props.playlist.id })),
		200
	);

	async componentWillReceiveProps(nextProps) {
		if (_.isEmpty(nextProps.songs) && nextProps.playlist !== this.props.playlist) {
			this.fetchSongs(nextProps);
		}
	}

	renderSongsList = () => {
		const { songs } = this.props;
		if (_.isEmpty(songs)) {
			return <p> Theres a first for everything </p>;
		} else {
			return _.map(songs, (song: any) => <SongRow key={song.id} songId={song.id} />);
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
						className={cx('pointer vote-info', { active: sort === 'votes' })}
						onClick={this.setSortHandler('votes')}
					>
						VOTES
					</span>
					<span
						className={cx('song-title pointer', { active: sort === 'title' })}
						onClick={this.setSortHandler('title')}
					>
						TITLE
					</span>
					<span
						className={cx('song-artist pointer', { active: sort === 'artist' })}
						onClick={this.setSortHandler('artist')}
					>
						ARIST
					</span>
					<span
						className={cx('song-artist pointer', { active: sort === 'playlist' })}
						onClick={this.setSortHandler('playlist')}
					>
						PLAYLIST
					</span>
					<span
						className={cx('song-date pointer', { active: sort === 'date' })}
						onClick={this.setSortHandler('date')}
					>
						POSTED
					</span>
					<span
						className={cx('song-postee pointer', { active: sort === 'user' })}
						onClick={this.setSortHandler('user')}
					>
						USER
					</span>
					<span
						className={cx('song-duration pointer', { active: sort === 'duration' })}
						onClick={this.setSortHandler('duration')}
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

export default connect(state => {
	return {
		songs: getSortedSongsDenormalized(state),
		playlist: getCurrentPlaylist(state),
	};
})(SongList);
