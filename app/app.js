import React from 'react'
import { render } from 'react-dom'
import { Router, Route, browserHistory } from 'react-router'

//var Landing = require('./components/landing.js');
var About = require('./components/about.js');


var router = (
    <Router history={browserHistory}>
      <Route path="/" component={About}/>
    </Router>
);

render(router, document.getElementById("app"));
