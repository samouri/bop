import * as React from 'react';
import * as Select from 'react-select';
import 'react-select/dist/react-select.css';
import * as cx from 'classnames';
import * as _ from 'lodash';

import { mapLastFmItemToBop } from '../sdk';

const spotifyEndpoint = 'https://api.spotify.com/v1/search?type=track&limit=5';
const lastFMEndpoint = `http://ws.audioscrobbler.com/2.0/?method=track.search&format=json&api_key=39e1ebe26072b1ee0c6b4b9c1ca22889&track=`;

const mapSongsToOptions = (songs: any): Option[] => {
	return songs.map(track => ({ value: track, label: track.title }));
};

const getOptions = (input, cb) => {
	window.sdk.searchForSong(input).then(async songs => {
		const ret = { options: mapSongsToOptions(songs), cache: false };
		console.error('found these fuckers', ret);
		cb(undefined, ret);
	});
};
const debouncedGetOptions = _.debounce(getOptions, 300);

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
				loadOptions={debouncedGetOptions}
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
