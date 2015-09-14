var React = require('react');

var Header = React.createClass({
  render: function () {
    return (
      <div id="header" className="row">
        <div className="pull-left">
          <h1 id="bop_header" className="pull-left"> Bop </h1>
          <h2 id ="seattle_header" className="pull-left"> Seattle </h2>
        </div>
        <div className="pull-right">
          <img className="pull-right" id="gear" src="images/gear.png"/>
          <h1 className="pull-right" id="about"> About</h1>
        </div>
      </div>
    );
  }
});

module.exports = Header;
