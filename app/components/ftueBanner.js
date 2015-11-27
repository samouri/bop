var React = require('react');
var cx = require('classnames');

var FTUEHero = React.createClass({
  playClickHandler: function() {
    this.props.playClickHandler();
  },

  render: function () {
    return (
      <div id="ftue-hero">
        <div> <span id="ftue-hero-text">Discover and share music <br/> with people around you.</span></div>
        <div id="ftue-play-button" onClick={this.playClickHandler}><span id="ftue-play-button-text">Play</span></div>
      </div>
    );
  }
});

module.exports = FTUEHero;
