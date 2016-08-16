import React from 'react';

export default class FTUEHero extends React.Component {

  render() {
    return (
      <div id="ftue-hero">
        <div> <span id="ftue-hero-text">Discover and share music <br/> with people around you.</span></div>
        <div id="ftue-play-button" onClick={this.props.onPlay}><span id="ftue-play-button-text">Play</span></div>
      </div>
    );
  }
}

