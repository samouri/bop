import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import * as promise from 'redux-promise';
import PlaylistPage from './components/playlist-page';
import PlayingBar from './components/playing-bar';
import './style.css';

import bopApp from './state/reducer';

let store = createStore(bopApp, applyMiddleware(thunk, promise, logger));

const Root = ({ store }: { store: any }) =>
	<Provider store={store}>
		<Router>
			<div>
				<Route exact path="/" component={PlaylistPage} />
				<Route path="/p/:playlistName" component={PlaylistPage} />
				<Route path="" component={PlayingBar} />
			</div>
		</Router>
	</Provider>;

ReactDOM.render(<Root store={store} />, document.getElementById('root'));
