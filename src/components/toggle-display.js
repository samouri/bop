import React from 'react';

export default class ToggleDisplay extends React.Component {
  render() {
    let style = {}
    if (! this.props.show) {
      style.display = 'none';
    }
    return <span style={style}> { this.props.children } </span>
  }
}

ToggleDisplay.propTypes = {
  show: React.PropTypes.bool
};
