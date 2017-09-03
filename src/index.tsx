import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import * as promise from 'redux-promise';
import PlaylistPage from './components/playlist-page';
import Header from './components/header';
import FeedPage from './components/feed-page';
import UserPage from './components/user-page';
import LeaderboardPage from './components/leaderboard-page';
import PlayingBar from './components/playing-bar';
import './style.css';

import bopApp from './state/reducer';

let store = createStore(bopApp, applyMiddleware(thunk, promise, logger));

const Root = ({ store }: { store: any }) =>
	<Provider store={store}>
		<Router>
			<div>
				<Route component={Header} />
				<Route exact path="/" component={FeedPage} />
				<Route path="/p/:playlistName" component={PlaylistPage} />
				<Route path="/u/:username" component={UserPage} />
				<Route path="/leaderboards" component={LeaderboardPage} />
				<Route component={PlayingBar} />
			</div>
		</Router>
	</Provider>;

ReactDOM.render(<Root store={store} />, document.getElementById('root'));
