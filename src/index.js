/* External Dependencies */
import React, { PropTypes } from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';

/* Internal Dependencies */
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

Root.propTypes = {
	store: PropTypes.object.isRequired,
};

render(<Root store={store} />, document.getElementById('root'));
