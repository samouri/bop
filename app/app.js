const React = require('react');
const ReactRouter = require('react-router');
const Router = ReactRouter.Router;
const Route = ReactRouter.Route;
const DefaultRoute = ReactRouter.DefaultRoute;


var Landing = require('./components/landing.js');
var About = require('./components/about.js');


var router = (
    <Router path="/">
      <DefaultRoute handler={Landing}/>
      <Route path=":region" handler={Landing}/>
    </Router>
);

render(router, document.body);
