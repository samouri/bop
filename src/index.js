import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import Landing from './components/landing';
import './style.css';

import bopApp from './app/reducer';

let store = createStore(bopApp, applyMiddleware(thunk, createLogger()));

const Root = ({ store }) => (
	<Provider store={store}>
		<Router history={browserHistory}>
			<Route path="/" component={Landing} />
			<Route path="/p/:playlistName" component={Landing} />
		</Router>
	</Provider>
);

render(<Root store={store} />, document.getElementById('root'));
