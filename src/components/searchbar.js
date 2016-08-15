var React = require('react');
var ReactDOM = require('react-dom');

var SearchBar = React.createClass({
  getInitialState: function() {
      return {userInput: ''};
  },
  handleChange: function(e) {
    this.setState({userInput: e.target.value});
  },
  componentDidMount: function(){
    this.setupTypeahead();
  },
  setupTypeahead: function() {
    var _this = this;
    _this.data = {};
    _this.youtubeVideos = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: 'https://www.googleapis.com/youtube/v3/search?type=video&maxResults=20&key=AIzaSyAPGx5PbhdoO2QTR16yZHgMj-Q2vqO8W1M&part=snippet&q=%QUERY',
        wildcard: '%QUERY',
        transform: function(resp) {
          _this.data = $.extend(_this.data, resp.items.reduce(function(memo, item) {
            memo[item.snippet.title] = item;
            return memo;
          }, {}));
          return resp.items.map(function(elem) {return elem.snippet.title});
        }
    }});
    $(ReactDOM.findDOMNode(_this.refs.typeahead)).typeahead(null, {
      source: _this.youtubeVideos,
      templates: {
        suggestion: function(val) {
          return '<div class="">' + '<img src="' + _this.data[val].snippet.thumbnails.default.url +'"></img> ' + val + '</div>';
        }
      }
    });
    $(ReactDOM.findDOMNode(_this.refs.typeahead)).on('typeahead:selected', function(evt, selected) {
      var item = _this.data[selected];
      _this.props.handleSelection({
        youtube_id: item.id.videoId,
        youtube_title: item.snippet.title,
        thumbnail_url: item.snippet.thumbnails.default.url
      });
    });
  },
  render: function () {
    return (
      <div>
        <input id="typeahead" type="text" ref="typeahead" className="pull-right" placeholder="Add song" value={this.state.userInput}  onChange={this.handleChange} />
        <i className="fa fa-search fa-2x pull-right"> </i>
      </div>
    );
  }
});

module.exports = SearchBar;
