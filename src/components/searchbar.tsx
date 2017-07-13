import * as React from 'react';
import * as Select from 'react-select';
import 'react-select/dist/react-select.css';
import * as cx from 'classnames';

import { mapSpotifyItemToBop } from '../sdk';

const spotifyEndpoint = 'https://api.spotify.com/v1/search?type=track&limit=5';

const mapResponseToOptions = (resp: any): Option[] => {
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

type Option = {
	value: { thumbnail_url: string; artist: string; title: string };
};
type TrackValueProps = {
	option: Option;
	isFocused: boolean;
	isSelected: boolean;
	onSelect: (Option, event: any) => void;
	onFocus: (Option, event: any) => void;
};

class TrackValue extends React.Component<TrackValueProps> {
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
		const { option, isFocused, isSelected } = this.props;
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

type SearchBarProps = {
	handleSelection: (string) => void;
};

export default class SearchBar extends React.Component<SearchBarProps> {
	render() {
		return (
			<Select.Async
				loadOptions={loadOptions}
				name="form-field-name"
				value="one"
				autoload={false}
				optionComponent={TrackValue}
				onValueClick={(option: any) => {
					console.error(option);
					this.props.handleSelection(option.value);
				}}
				onChange={(option: any) => {
					option && this.props.handleSelection(option.value);
				}}
			/>
		);
	}
}
// filterOption={() => true}
