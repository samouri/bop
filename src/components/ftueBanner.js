// @flow
import React from 'react';

import { connect } from 'react-redux';
import { playSong } from '../app/actions';
import { getSortedSongs } from '../app/reducer';

const mapStateToProps = state => ({
	firstSong: getSortedSongs(state)[0],
});

const FTUEHero = ({ playSong, firstSong }) => (
	<div id="ftue-hero" className="row">
		<div>
			<span id="ftue-hero-text">Discover and share music <br /> with people around you.</span>
		</div>
		<div id="ftue-play-button" onClick={() => playSong(firstSong)}>
			<span id="ftue-play-button-text">Play</span>
		</div>
	</div>
);

export default connect(mapStateToProps, { playSong })(FTUEHero);
