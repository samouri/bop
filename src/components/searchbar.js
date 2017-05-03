var React = require('react');
var ReactDOM = require('react-dom');

import { mapSpotifyItemToBop } from '../sdk';

/* eslint-disable */
// TODO find a replacement for bloodhound + typeahead seeing as they are basically deprecated projects
// ideally one that is react-friendly
export default class SearchBar extends React.Component {
	state = {
		userInput: '',
	};

	handleChange = event => {
		this.setState({ userInput: event.target.value });
	};

	componentDidMount() {
		this.setupTypeahead();
	}

	setupTypeahead() {
		var _this = this;
		_this.data = {};
		_this.youtubeVideos = new Bloodhound({
			// eslint-disable-line
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace, // eslint-disable-line
			queryTokenizer: Bloodhound.tokenizers.whitespace, // eslint-disable-line
			remote: {
				url: 'https://api.spotify.com/v1/search?type=track&q=%QUERY',
				wildcard: '%QUERY',
				transform: function(resp) {
					const tracks = resp.tracks.items.map(mapSpotifyItemToBop);
					tracks.forEach(track => (_this.data[track.title] = track));
					return tracks.map(track => track.title);
				},
			},
		});

		$(ReactDOM.findDOMNode(_this.refs.typeahead)).typeahead(null, {
			// eslint-disable-line
			source: _this.youtubeVideos,
			templates: {
				suggestion: function(val) {
					return (
						'<div class="search-result-thumbnail-wrapper">' +
						`<img src="${_this.data[val].thumbnail_url}"></img>` +
						`${val} by ${_this.data[val].artist}` +
						'</div>'
					);
				},
			},
		});

		$(ReactDOM.findDOMNode(_this.refs.typeahead)).on('typeahead:selected', function(evt, selected) {
			_this.props.handleSelection(_this.data[selected]);
		});
	}

	render() {
		return (
			<div>
				<input
					id="typeahead"
					type="text"
					ref="typeahead"
					className="pull-right"
					placeholder="Add song"
					value={this.state.userInput}
					onChange={this.handleChange}
				/>
				<i className="fa fa-search fa-2x pull-right"> </i>
			</div>
		);
	}
}

/* eslint-enable */
