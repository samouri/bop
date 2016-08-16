import React from 'react'
import { render } from 'react-dom'
import { Router, Route, browserHistory } from 'react-router'
import './style.css';
import Landing from './components/landing';

let router = (
    <Router history={browserHistory}>
      <Route path="/" component={Landing}/>
      <Route path="/:playlist" component={Landing}/>
    </Router>
);

render(router, document.getElementById("root"));
