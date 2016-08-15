import React from 'react'
import { render } from 'react-dom'
import { Router, Route, browserHistory } from 'react-router'
import './style.css';

var Landing = require('./components/landing.js');
var About = require('./components/about.js');


var router = (
    <Router history={browserHistory}>
      <Route path="/" component={Landing}/>
      <Route path=":region" handler={Landing}/>
    </Router>
);

render(router, document.getElementById("root"));
