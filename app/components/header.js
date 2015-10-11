var React = require('react');
var cx = require('classnames');

var Header = React.createClass({
  getInitialState: function() {
    return {
      showEmailForm: false,
      loginText: null
    };
  },

  componentWillReceiveProps: function(props) {
    var loginText = "Login"
    if (! $.isEmptyObject(props.userInfo)) {
      loginText = props.userInfo.username;
    }
    this.setState({ loginText: loginText});
  },

  _loginOnMouseOver: function() {
    if (! $.isEmptyObject(this.props.userInfo)) {
      this.setState({ loginText: "Logout"});
    }
  },

  _loginOnMouseOut: function() {
    var loginText = "Login";
    if (! $.isEmptyObject(this.props.userInfo)) {
      loginText = this.props.userInfo.username
    }
    this.setState({ loginText: loginText});
  },

  loginClickHandler: function() {
    if (this.state.loginText === "Logout") {
      this.props.logoutHandler();
      this.setState({loginText: "Login"});
    } else {
      this.setState({showEmailForm: !this.state.showEmailForm});
    }
  },

  sendTokenClickHandler: function(e) {
    var emailForm = React.findDOMNode(this.refs.emailForm);
    this.setState({showEmailForm: false});
    this.props.sendTokenHandler(emailForm.value);
  },

  render: function () {
    var loginInfoClasses = cx('row', {
      hidden: ! this.state.showEmailForm
    });

    return (
      <div>
        <div id="header" className="row">
          <div className="col-xs-4"> <h1 id="bop_header" className="pull-left"> Bop </h1>
            <h2 id ="seattle_header" className="pull-left"> {this.props.region.substring(0,10)} </h2>
          </div>
          <div className="col-xs-3 col-xs-offset-5">
            <img className="pull-right" id="gear" src="images/gear.png"/>
            <h3 className="pull-right pointer" onClick={this.loginClickHandler} onMouseOver={this._loginOnMouseOver} onMouseOut={this._loginOnMouseOut}> {this.state.loginText} </h3>
          </div>
        </div>
        <div id="login-info" className={loginInfoClasses}>
          <form role="form" data-toggle="validator" className="col-xs-12">
            <button type="button" onClick={this.sendTokenClickHandler} className="btn btn-primary pull-right">Send token</button>
            <div className="form-group pull-right">
              <input type="email" id="inputEmail" placeholder="example@email.com" ref="emailForm"></input>
              <div className="help-block with-errors"></div>
            </div>
          </form>
        </div>
      </div>
    );
  }
});

module.exports = Header;
