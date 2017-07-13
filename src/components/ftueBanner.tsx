// @flow
import * as React from 'react';

import { connect } from 'react-redux';
import { playSong } from '../state/actions';
import { getSortedSongs } from '../state/reducer';

const mapStateToProps = (state: any) => ({
	firstSong: getSortedSongs(state)[0],
});

const FTUEHero = ({ playSong, firstSong }: { playSong: any; firstSong: object }) =>
	<div id="ftue-hero" className="row">
		<div>
			<span id="ftue-hero-text">
				Discover and share music <br /> with people around you.
			</span>
		</div>
		<div id="ftue-play-button" onClick={() => playSong(firstSong)}>
			<span id="ftue-play-button-text">Play</span>
		</div>
	</div>;

export default connect(mapStateToProps, { playSong })(FTUEHero);
