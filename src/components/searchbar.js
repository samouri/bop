import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import _ from 'lodash';

import { mapSpotifyItemToBop } from '../sdk';

const spotifyEndpoint = 'https://api.spotify.com/v1/search?type=track&limit=5';

const loadOptions = input => {
	return fetch(`${spotifyEndpoint}&q=${input}`)
		.then(response => {
			return response.json();
		})
		.then(json => {
			const ret = { options: mapResponseToTitles(json) };
			return ret;
		});
};

const mapResponseToTitles = resp => {
	const tracks = resp.tracks.items.map(mapSpotifyItemToBop);
	// tracks.forEach(track => (this.data[track.title] = track));
	// console.error(tracks.map(track => track.title));
	return tracks.map(track => ({ value: track, label: track.title }));
	// return tracks;
};

class TrackValue extends React.Component {
	render() {
		const { children, placeholder, option } = this.props;
		const { thumbnail_url, artist, title } = option.value;
		console.error(option);
		return (
			<div className="search-result-thumbnail-wrapper">
				<img src={thumbnail_url} />
				{title} by {artist}
			</div>
		);
	}
}

/* eslint-disable */
export default class SearchBar extends React.Component {
	render() {
		return (
			<Select.Async
				name="form-field-name"
				value="one"
				loadOptions={loadOptions}
				autoload={false}
				optionComponent={TrackValue}
			/>
		);
	}
}

/* eslint-enable */
