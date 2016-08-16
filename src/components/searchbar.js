var React = require('react');
var ReactDOM = require('react-dom');

// TODO find a replacement for bloodhound + typeahead seeing as they are basically deprecated projects
// ideally one that is react-friendly
export default class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInput: ''
    };
  }

  handleChange = (event) => {
    this.setState({userInput: event.target.value});
  }

  componentDidMount(){
    this.setupTypeahead();
  }

  setupTypeahead() {
    var _this = this;
    _this.data = {};
    _this.youtubeVideos = new Bloodhound({ // eslint-disable-line
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace, // eslint-disable-line
      queryTokenizer: Bloodhound.tokenizers.whitespace, // eslint-disable-line
      remote: {
        url: 'https://www.googleapis.com/youtube/v3/search?type=video&maxResults=20&key=AIzaSyAPGx5PbhdoO2QTR16yZHgMj-Q2vqO8W1M&part=snippet&q=%QUERY',
        wildcard: '%QUERY',
        transform: function(resp) {
          _this.data = $.extend(_this.data, resp.items.reduce(function(memo, item) { // eslint-disable-line
            memo[item.snippet.title] = item;
            return memo;
          }, {}));
          return resp.items.map(function(elem) {return elem.snippet.title});
        }
    }});

    $(ReactDOM.findDOMNode(_this.refs.typeahead)).typeahead(null, {  // eslint-disable-line
      source: _this.youtubeVideos,
      templates: {
        suggestion: function(val) {
          return '<div class=""> <img src="' + _this.data[val].snippet.thumbnails.default.url +'"></img> ' + val + '</div>';
        }
      }
    });

    $(ReactDOM.findDOMNode(_this.refs.typeahead)).on('typeahead:selected', function(evt, selected) { // eslint-disable-line
      var item = _this.data[selected];
      _this.props.handleSelection({
        youtube_id: item.id.videoId,
        youtube_title: item.snippet.title,
        thumbnail_url: item.snippet.thumbnails.default.url
      });
    });
  }

  render() {
    return (
      <div>
        <input id="typeahead" type="text" ref="typeahead" className="pull-right" placeholder="Add song" value={this.state.userInput}  onChange={this.handleChange} />
        <i className="fa fa-search fa-2x pull-right"> </i>
      </div>
    );
  }
}

