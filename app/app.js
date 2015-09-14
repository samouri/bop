const React = require('react');
const ReactRouter = require('react-router');
const Router = ReactRouter.Router;
const Route = ReactRouter.Route;
const Link = ReactRouter.Link;

var RouteHandler = ReactRouter.RouteHandler;
var DefaultRoute = ReactRouter.DefaultRoute;
var Navigation = ReactRouter.Navigation;
var Header = require('./components/header.js');
var Landing = require('./components/landing.js');
var About = require('./components/about.js');

var App = React.createClass({
  mixins: [Navigation],

  render: function() {
    return (
      <div>
        <Header className={'row'}/>
        <RouteHandler/>
      </div>
    );
  }
});

var routes = (
    <Route path="/" handler={App}>
      <DefaultRoute handler={Landing}/>
    </Route>
);

ReactRouter.run(routes, function (Handler) {
    React.render(<Handler />, document.body);
});

