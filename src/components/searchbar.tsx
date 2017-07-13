import * as React from 'react';
import * as Select from 'react-select';
import 'react-select/dist/react-select.css';
import * as cx from 'classnames';

import { mapSpotifyItemToBop } from '../sdk';

const spotifyEndpoint = 'https://api.spotify.com/v1/search?type=track&limit=5';

const mapResponseToOptions = resp => {
	const tracks = resp.tracks.items.map(mapSpotifyItemToBop);
	return tracks.map(track => ({ value: track, label: track.title }));
};

const loadOptions = async input => {
	return fetch(`${spotifyEndpoint}&q=${input}`)
		.then(response => {
			return response.json();
		})
		.then(async json => {
			const ret = { options: mapResponseToOptions(json) };
			return ret;
		});
};

class TrackValue extends React.Component {
	handleMouseDown = event => {
		event.preventDefault();
		event.stopPropagation();
		this.props.onSelect(this.props.option, event);
	};
	handleMouseEnter = event => {
		this.props.onFocus(this.props.option, event);
	};
	handleMouseMove = event => {
		if (this.props.isFocused) return;
		this.props.onFocus(this.props.option, event);
	};
	render() {
		const { children, option, isFocused, isSelected } = this.props;
		const { thumbnail_url, artist, title } = option.value;
		return (
			<div
				className={cx('search-result-thumbnail-wrapper', {
					'is-focused': isFocused || isSelected,
				})}
				onMouseDown={this.handleMouseDown}
				onMouseEnter={this.handleMouseEnter}
				onMouseMove={this.handleMouseMove}
			>
				<img alt="artist thumb" src={thumbnail_url} />
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
				onValueClick={option => {
					console.error(option);
					this.props.handleSelection(option.value);
				}}
				onChange={option => {
					option && this.props.handleSelection(option.value);
				}}
				filterOption={() => true}
			/>
		);
	}
}

/* eslint-enable */
