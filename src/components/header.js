var React = require('react');
var cx = require('classnames');
let _ = require('lodash');

export default class Header extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      showLoginForm: false,
      showCreateUser: false,
      username: '',
      password: '',
    }
  }

  handleLogin = (e) => {
    e.preventDefault();

    this.setState({showLoginForm: false});

    this.props.onLogin({
      username: this.state.username,
      password: this.state.password
    });
  }

  handleClick = () => {
    this.setState({ showLoginForm: true});
  }

  handleUsernameChange = (event) => {
    this.setState({username: event.target.value});
  }

  handlePasswordChange = (event) => {
    this.setState({password: event.target.value});
  }

  render() {
    var loginInfoClasses = cx({
      hidden: ! this.state.showLoginForm
    });

   let loginText = _.isUndefined(this.props.username)? "Login" : this.props.username;
   return (
      <div>
        <div id="header" className="row">
          <div className="col-xs-4"> <h1 id="bop_header" className="pull-left"> Bop </h1>
            <h2 id="seattle_header" className="pull-left"> {this.props.playlist.substring(0,10)} </h2>
          </div>
          <div className="col-xs-3 col-xs-offset-5">
            <h3 className="pull-right pointer" onClick={this.handleClick}> {loginText} </h3>
          </div>
        </div>
        <div id="login-info" className={loginInfoClasses} style={{position: 'relative'}}>
          <div style={{position: 'absolute', right: '0px'}}>
            <form>
              <input type="username" placeholder="username" value={this.state.username} onChange={this.handleUsernameChange}></input>
              <input type="text" placeholder="password" value={this.state.password} onChange={this.handlePasswordChange}></input>
              <button type='submit' style={{display: "none"}} onClick={this.handleLogin}/>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

