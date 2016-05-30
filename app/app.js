import React from 'react'
import { render } from 'react-dom'
import { Router, Route, browserHistory } from 'react-router'

import BopPlayer from './components/bop-player.js';
import LocalHeader from './components/localheader.js';

var router = (
    <Router history={browserHistory}>
      <Route path="/" component={BopPlayer}/>
      <Route path="/derp" component={LocalHeader}/>
    </Router>
);

render(router, document.getElementById("app"));
