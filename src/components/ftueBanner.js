var React = require('react');

var FTUEHero = React.createClass({
  handlePlayClick: function() {
    this.props.handlePlayClick();
  },

  render: function () {
    return (
      <div id="ftue-hero">
        <div> <span id="ftue-hero-text">Discover and share music <br/> with people around you.</span></div>
        <div id="ftue-play-button" onClick={this.handlePlayClick}><span id="ftue-play-button-text">Play</span></div>
      </div>
    );
  }
});

module.exports = FTUEHero;
