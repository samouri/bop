// @flow
import * as React from 'react';

import { connect } from 'react-redux';
import { playSong } from '../state/actions';
import { getSortedSongs } from '../state/reducer';

const mapStateToProps = (state: any) => ({
	firstSong: getSortedSongs(state)[0],
});

const FTUEHero = ({ playSong, firstSong }: { playSong: any; firstSong: any }) =>
	<div id="ftue-hero">
		<div>
			<span id="ftue-hero-text">
				Discover and share music <br /> with people around you.
			</span>
		</div>
		<div id="ftue-play-button" onClick={() => playSong({ songId: firstSong.id })}>
			<span id="ftue-play-button-text">Play</span>
		</div>
	</div>;

export default connect(mapStateToProps, { playSong })(FTUEHero);
