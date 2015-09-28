const React = require('react');
const ReactRouter = require('react-router');
const Router = ReactRouter.Router;
const Route = ReactRouter.Route;
const Link = ReactRouter.Link;

var RouteHandler = ReactRouter.RouteHandler;
var DefaultRoute = ReactRouter.DefaultRoute;
var Navigation = ReactRouter.Navigation;
var Landing = require('./components/landing.js');
var About = require('./components/about.js');


var routes = (
    <Route path="/">
      <DefaultRoute handler={Landing}/>
      <Route path=":region" handler={Landing}/>
    </Route>
);

ReactRouter.run(routes, ReactRouter.HistoryLocation, function (Handler) {
    React.render(<Handler />, document.body);
});
