import React from 'react';

import { connect } from 'react-redux';
import { playSong } from '../app/actions';
import { getSortedSongs } from '../app/reducer';

function mapStateToProps(state) {
	return {
		firstSong: getSortedSongs(state)[0],
	};
}

function mergeProps({ firstSong }, { dispatch }) {
	return {
		handleOnClick: () => dispatch(playSong(firstSong.id)),
	};
}

function FTUEHero(props) {
	return (
		<div id="ftue-hero" className="row">
			<div>
				{' '}
				<span id="ftue-hero-text">Discover and share music <br /> with people around you.</span>
			</div>
			<div id="ftue-play-button" onClick={props.handleOnClick}>
				<span id="ftue-play-button-text">Play</span>
			</div>
		</div>
	);
}

export default connect(mapStateToProps, null, mergeProps)(FTUEHero);
